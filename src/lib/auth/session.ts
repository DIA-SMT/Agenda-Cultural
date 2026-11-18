import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isDatabaseConfigured, query } from "@/lib/db";
import { findAccountById, sessionStillValid, type StaffRole } from "@/services/admin/accounts";
import { readSessionToken, SESSION_COOKIE, sessionSecret } from "@/lib/auth/token";

export interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
}

/** Integrante del equipo con sesión válida, o null. Se resuelve una vez por pedido. */
export const currentStaff = cache(async (): Promise<StaffMember | null> => {
  // La cookie se lee primero, siempre: eso marca las páginas del panel como dinámicas aun sin base de datos
  // (si no, Next las prerenderiza durante el build como una redirección fija al login).
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!isDatabaseConfigured) return null;
  const payload = readSessionToken(token, sessionSecret());
  if (!payload) return null;
  const account = await findAccountById(query, payload.sub);
  if (!sessionStillValid(account, payload.auth)) return null;
  return { id: account.id, email: account.email, name: account.full_name, role: account.role };
});

/**
 * Exige una sesión del equipo. Llamarla en CADA página y Server Action del panel: proxy.ts sólo hace un
 * filtro rápido con la firma de la cookie, y el layout no protege las acciones.
 */
export async function requireStaff(): Promise<StaffMember> {
  const staff = await currentStaff();
  if (!staff) redirect("/admin/login");
  return staff;
}

export async function requireAdmin(): Promise<StaffMember> {
  const staff = await requireStaff();
  if (staff.role !== "admin") redirect("/admin?aviso=solo-admin");
  return staff;
}
