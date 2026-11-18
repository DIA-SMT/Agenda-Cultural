"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Ingresá un correo válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});
type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [serverError, setServerError] = useState<string>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  // Pendiente: el proveedor de autenticación de la VPS todavía no está definido.
  async function onSubmit() {
    setServerError("El acceso administrativo todavía no está habilitado.");
  }

  return (
    <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="field"><span>Correo electrónico</span><div className="input-icon"><Mail size={18} /><input type="email" autoComplete="email" {...register("email")} /></div>{errors.email && <small className="field-error">{errors.email.message}</small>}</label>
      <label className="field"><span>Contraseña</span><div className="input-icon"><LockKeyhole size={18} /><input type="password" autoComplete="current-password" {...register("password")} /></div>{errors.password && <small className="field-error">{errors.password.message}</small>}</label>
      {serverError && <p className="form-error" role="alert">{serverError}</p>}
      <button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Ingresando…" : "Ingresar"}</button>
      <a href="#recuperar" className="forgot-link">¿Olvidaste tu contraseña?</a>
    </form>
  );
}
