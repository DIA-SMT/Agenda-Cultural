import type { Query } from "@/lib/db";

export type StaffRole = "admin" | "editor";

export interface AccountRow {
  id: string;
  email: string;
  full_name: string;
  role: StaffRole;
  status: "active" | "inactive";
  password_hash: string | null;
  sessions_valid_since: Date | string;
}

const accountColumns = "id, email, full_name, role, status, password_hash, sessions_valid_since";

export async function findAccountByEmail(query: Query, email: string) {
  const [row] = await query<AccountRow>(`select ${accountColumns} from public.profiles where email = $1`, [email.trim().toLowerCase()]);
  return row ?? null;
}

export async function findAccountById(query: Query, id: string) {
  // El id viene de una cookie: si no es un UUID, ni se consulta.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await query<AccountRow>(`select ${accountColumns} from public.profiles where id = $1`, [id]);
  return row ?? null;
}

/** Una sesión vale si la cuenta está activa, tiene contraseña y el ingreso es posterior al último corte. */
export function sessionStillValid(account: AccountRow | null, authSeconds: number): account is AccountRow {
  if (!account || account.status !== "active" || !account.password_hash) return false;
  return authSeconds * 1000 >= new Date(account.sessions_valid_since).getTime();
}

export async function markLogin(query: Query, id: string) {
  await query("update public.profiles set last_login_at = now() where id = $1", [id]);
}

// Límite de intentos fallidos en los últimos 15 minutos: por correo frena a quien prueba contraseñas de una
// cuenta; por IP, a quien recorre cuentas. Un ingreso correcto no borra los fallos: simplemente dejan de contar.
const WINDOW = "15 minutes";
const MAX_FAILURES_PER_EMAIL = 5;
const MAX_FAILURES_PER_IP = 20;

export async function tooManyAttempts(query: Query, email: string, ip: string | null) {
  const [row] = await query<{ by_email: number; by_ip: number }>(`
    select
      count(*) filter (where email = $1)::int as by_email,
      count(*) filter (where $2::text is not null and ip = $2)::int as by_ip
    from public.login_attempts
    where not succeeded and created_at > now() - interval '${WINDOW}'
  `, [email, ip]);
  return row.by_email >= MAX_FAILURES_PER_EMAIL || row.by_ip >= MAX_FAILURES_PER_IP;
}

export async function recordAttempt(query: Query, email: string, ip: string | null, succeeded: boolean) {
  await query("insert into public.login_attempts (email, ip, succeeded) values ($1, $2, $3)", [email, ip, succeeded]);
}
