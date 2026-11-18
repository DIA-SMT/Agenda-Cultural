// Contraseñas del equipo con scrypt (viene con Node: no suma dependencias).
// Es .mjs para que lo usen igual la aplicación y scripts/equipo.mjs.
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const N = 2 ** 15;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
// scrypt necesita 128·N·r bytes (32 MB con estos parámetros); el máximo por defecto de Node es justo eso.
const MAX_MEMORY = 64 * 1024 * 1024;
// Corto a pedido del equipo; lo compensa el límite de intentos del ingreso (src/services/admin/accounts.ts).
export const MIN_PASSWORD_LENGTH = 6;

function derive(password, salt, n, r, p) {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, { N: n, r, p, maxmem: MAX_MEMORY }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

/** Devuelve "scrypt$N$r$p$sal$hash" (sal y hash en base64). */
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await derive(password, salt, N, R, P);
  return ["scrypt", N, R, P, salt.toString("base64"), hash.toString("base64")].join("$");
}

export async function verifyPassword(password, stored) {
  const [scheme, n, r, p, salt, hash] = String(stored ?? "").split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await derive(password, Buffer.from(salt, "base64"), Number(n), Number(r), Number(p));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Para que una cuenta inexistente tarde lo mismo que una contraseña equivocada.
const DUMMY_HASH = "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
export async function verifyAgainstNothing(password) {
  await verifyPassword(password, DUMMY_HASH);
  return false;
}
