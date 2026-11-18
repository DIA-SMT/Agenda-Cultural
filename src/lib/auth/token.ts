import { createHmac, timingSafeEqual } from "node:crypto";

// Sesión del panel: una cookie con {sub, auth, exp} firmada con HMAC-SHA256. No guarda datos de la persona;
// el rol y si la cuenta sigue activa se leen de la base en cada página y acción.

export const SESSION_COOKIE = "agenda_sesion";
// Tres días, como FerIA: el panel se abre desde máquinas de oficina compartidas. Con la renovación
// deslizante, para quien lo usa seguido se comporta como una sesión que no vence.
export const SESSION_SECONDS = 60 * 60 * 24 * 3;

export interface SessionPayload {
  /** id de public.profiles */
  sub: string;
  /** Segundos Unix del ingreso con contraseña. Se conserva al renovar: es lo que compara sessions_valid_since. */
  auth: number;
  /** Segundos Unix de vencimiento. */
  exp: number;
}

export function sessionSecret() {
  const secret = process.env.SESION_SECRETO?.trim();
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    // No se inventa uno: cambiaría en cada despliegue y cerraría todas las sesiones.
    throw new Error("Falta SESION_SECRETO (32 caracteres o más) para las sesiones del panel.");
  }
  return "solo-para-desarrollo-no-usar-en-produccion-0000";
}

const nowSeconds = () => Math.floor(Date.now() / 1000);

function sign(data: string, secret: string) {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSessionToken(sub: string, secret: string, auth = nowSeconds()) {
  const payload: SessionPayload = { sub, auth, exp: nowSeconds() + SESSION_SECONDS };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

export function readSessionToken(token: string | undefined, secret: string, now = nowSeconds()): SessionPayload | null {
  const [data, signature, extra] = (token ?? "").split(".");
  if (!data || !signature || extra !== undefined) return null;
  const expected = Buffer.from(sign(data, secret));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as SessionPayload;
    if (typeof payload.sub !== "string" || typeof payload.auth !== "number" || typeof payload.exp !== "number") return null;
    return payload.exp > now ? payload : null;
  } catch {
    return null;
  }
}

/** A partir de la mitad de su vida, la cookie se reemplaza por una nueva con el mismo `auth`. */
export function needsRenewal(payload: SessionPayload, now = nowSeconds()) {
  return payload.exp - now < SESSION_SECONDS / 2;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    // En desarrollo sobre http://localhost no hay HTTPS; es la única excepción.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_SECONDS,
  };
}
