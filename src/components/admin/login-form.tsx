"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Ingresá un correo válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});
type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setServerError(undefined);
    if (!isSupabaseConfigured) {
      setServerError("El acceso estará disponible cuando se configuren las variables de Supabase.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) setServerError("No pudimos iniciar sesión. Revisá tus datos.");
    else router.push("/admin");
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
