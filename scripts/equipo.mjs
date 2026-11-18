#!/usr/bin/env node
// Cuentas del equipo que entra al panel. Las contraseñas se piden por teclado y no se muestran.
//
//   npm run equipo -- listar
//   npm run equipo -- crear correo@smt.gob.ar "Nombre Apellido" [editor|admin]
//   npm run equipo -- clave correo@smt.gob.ar           (asigna una contraseña nueva y cierra sus sesiones)
//   npm run equipo -- rol correo@smt.gob.ar admin|editor
//   npm run equipo -- desactivar correo@smt.gob.ar      (no puede entrar más; cierra sus sesiones)
//   npm run equipo -- activar correo@smt.gob.ar
//   npm run equipo -- cerrar-sesiones correo@smt.gob.ar
//
// En la VPS: cd /srv/agenda/actual && sudo -u agenda npm run equipo -- …  (por SSH con -t, para el teclado)
import { createInterface } from "node:readline";
import postgres from "postgres";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../src/lib/auth/password.mjs";

const [comando, email, ...resto] = process.argv.slice(2);

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL. Definila en .env o .env.local.");
  process.exit(1);
}

function preguntarOculto(pregunta) {
  if (!process.stdin.isTTY) throw new Error("Hace falta una terminal interactiva para escribir la contraseña (ssh -t).");
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    // Muestra la pregunta pero no lo que se escribe.
    rl._writeToOutput = (texto) => { if (texto.includes(pregunta)) process.stdout.write(pregunta); };
    rl.question(pregunta, (respuesta) => { rl.close(); process.stdout.write("\n"); resolve(respuesta); });
  });
}

async function pedirClave() {
  const clave = await preguntarOculto(`Contraseña nueva (${MIN_PASSWORD_LENGTH} caracteres o más): `);
  if (clave.length < MIN_PASSWORD_LENGTH) throw new Error(`La contraseña tiene que tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  if (clave !== await preguntarOculto("Repetila: ")) throw new Error("Las contraseñas no coinciden.");
  return hashPassword(clave);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1, onnotice: () => {} });
const correo = email?.trim().toLowerCase();

async function cuenta() {
  if (!correo) throw new Error("Falta el correo.");
  const [fila] = await sql`select id, email, full_name, role, status from public.profiles where email = ${correo}`;
  if (!fila) throw new Error(`No hay una cuenta con el correo ${correo}.`);
  return fila;
}

// Cortar sesiones: ninguna cookie emitida antes de este segundo vuelve a valer.
const corte = sql`date_trunc('second', now())`;

try {
  switch (comando) {
    case "listar": {
      const filas = await sql`select email, full_name, role, status, password_hash is not null as con_clave, last_login_at from public.profiles order by full_name`;
      if (!filas.length) console.log("Todavía no hay cuentas. Creá la primera con: npm run equipo -- crear correo \"Nombre\" admin");
      for (const f of filas) {
        const ultimo = f.last_login_at ? f.last_login_at.toISOString().slice(0, 16).replace("T", " ") : "nunca";
        console.log(`${f.email}  ${f.full_name}  ${f.role}  ${f.status}${f.con_clave ? "" : "  (sin contraseña)"}  último ingreso: ${ultimo}`);
      }
      break;
    }
    case "crear": {
      const [nombre, rol = "editor"] = resto;
      if (!correo || !nombre) throw new Error('Uso: crear correo "Nombre Apellido" [editor|admin]');
      if (!["editor", "admin"].includes(rol)) throw new Error("El rol es editor o admin.");
      const hash = await pedirClave();
      await sql`insert into public.profiles (email, full_name, role, status, password_hash)
        values (${correo}, ${nombre}, ${rol}, 'active', ${hash})`;
      console.log(`Cuenta creada: ${correo} (${rol}). Ya puede entrar en /admin/login.`);
      break;
    }
    case "clave": {
      const fila = await cuenta();
      const hash = await pedirClave();
      await sql`update public.profiles set password_hash = ${hash}, sessions_valid_since = ${corte} where id = ${fila.id}`;
      console.log(`Contraseña actualizada para ${fila.email}. Sus sesiones abiertas se cerraron.`);
      break;
    }
    case "rol": {
      const fila = await cuenta();
      const [rol] = resto;
      if (!["editor", "admin"].includes(rol)) throw new Error("El rol es editor o admin.");
      await sql`update public.profiles set role = ${rol} where id = ${fila.id}`;
      console.log(`${fila.email} ahora es ${rol}.`);
      break;
    }
    case "desactivar": {
      const fila = await cuenta();
      await sql`update public.profiles set status = 'inactive', sessions_valid_since = ${corte} where id = ${fila.id}`;
      console.log(`${fila.email} ya no puede entrar al panel.`);
      break;
    }
    case "activar": {
      const fila = await cuenta();
      await sql`update public.profiles set status = 'active' where id = ${fila.id}`;
      console.log(`${fila.email} puede volver a entrar${fila.status === "active" ? " (ya estaba activa)" : ""}.`);
      break;
    }
    case "cerrar-sesiones": {
      const fila = await cuenta();
      await sql`update public.profiles set sessions_valid_since = ${corte} where id = ${fila.id}`;
      console.log(`Se cerraron todas las sesiones de ${fila.email}.`);
      break;
    }
    default:
      console.error("Comandos: listar, crear, clave, rol, desactivar, activar, cerrar-sesiones. Ver el encabezado de scripts/equipo.mjs.");
      process.exitCode = 1;
  }
} catch (error) {
  console.error(error.code === "23505" ? `Ya hay una cuenta con el correo ${correo}.` : error.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
