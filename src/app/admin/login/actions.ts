"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifyAgainstNothing, verifyPassword } from "@/lib/auth/password.mjs";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions, sessionSecret } from "@/lib/auth/token";
import { isDatabaseConfigured, query } from "@/lib/db";
import { findAccountByEmail, markLogin, recordAttempt, tooManyAttempts } from "@/services/admin/accounts";

export interface LoginState {
  error?: string;
  email?: string;
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

// Sólo se vuelve a páginas del panel: nada de "//otro-sitio" ni rutas públicas.
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return /^\/admin(\/[\w\-/]*)?$/.test(next) && next !== "/admin/login" ? next : "/admin";
}

async function clientIp() {
  const list = await headers();
  // nginx manda X-Real-IP con la dirección del cliente; X-Forwarded-For puede venir armado por el cliente.
  return list.get("x-real-ip") ?? list.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  if (!isDatabaseConfigured) return { error: "El panel necesita la base de datos (falta DATABASE_URL)." };

  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  const email = typeof formData.get("email") === "string" ? String(formData.get("email")) : "";
  if (!parsed.success) return { error: "Ingresá un correo válido y tu contraseña.", email };

  const ip = await clientIp();
  if (await tooManyAttempts(query, parsed.data.email, ip)) {
    return { error: "Hubo demasiados intentos fallidos. Esperá 15 minutos y volvé a probar.", email };
  }

  const account = await findAccountByEmail(query, parsed.data.email);
  const ok = account?.status === "active" && account.password_hash
    ? await verifyPassword(parsed.data.password, account.password_hash)
    : await verifyAgainstNothing(parsed.data.password);
  await recordAttempt(query, parsed.data.email, ip, ok);
  // El mismo mensaje para cuenta inexistente, inactiva o contraseña equivocada: no se confirma qué cuentas existen.
  if (!ok || !account) return { error: "El correo o la contraseña no son correctos.", email };

  await markLogin(query, account.id);
  (await cookies()).set(SESSION_COOKIE, createSessionToken(account.id, sessionSecret()), sessionCookieOptions());
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
