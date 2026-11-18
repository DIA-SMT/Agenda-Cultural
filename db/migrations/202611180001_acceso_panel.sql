-- Ingreso al panel con email y contraseña, sin servicios externos (como FerIA y la Subasta).

alter table public.profiles
  -- scrypt (ver src/lib/auth/password.mjs). Nulo hasta que la persona elige su contraseña.
  add column password_hash text,
  -- Ninguna sesión iniciada antes de este instante vale: cambiar la contraseña, desactivar la cuenta o
  -- cerrar todas las sesiones mueve esta fecha y las cookies viejas dejan de servir en el siguiente pedido.
  add column sessions_valid_since timestamptz not null default date_trunc('second', now()),
  add column last_login_at timestamptz;

-- Intentos de ingreso, para frenar a quien prueba contraseñas.
create table public.login_attempts (
  id bigint generated always as identity primary key,
  email text not null,
  ip text,
  succeeded boolean not null,
  created_at timestamptz not null default now()
);

create index login_attempts_email_idx on public.login_attempts (email, created_at desc);
create index login_attempts_ip_idx on public.login_attempts (ip, created_at desc);
