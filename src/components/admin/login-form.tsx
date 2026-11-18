"use client";

import { LockKeyhole, Mail } from "lucide-react";
import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/login/actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form className="login-form" action={action}>
      <input type="hidden" name="next" value={next ?? ""} />
      <label className="field"><span>Correo electrónico</span><div className="input-icon"><Mail size={18} /><input id="login-email" type="email" name="email" autoComplete="username" required defaultValue={state.email} /></div></label>
      <label className="field"><span>Contraseña</span><div className="input-icon"><LockKeyhole size={18} /><input id="login-password" type="password" name="password" autoComplete="current-password" required /></div></label>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Ingresando…" : "Ingresar"}</button>
      <p className="login-help">¿Olvidaste tu contraseña? Pedile a un administrador del panel que te asigne una nueva.</p>
    </form>
  );
}
