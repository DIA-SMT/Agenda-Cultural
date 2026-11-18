import { FlaskConical } from "lucide-react";
import { isDatabaseConfigured } from "@/lib/db";

export function DemoNotice() {
  if (isDatabaseConfigured) return null;
  return (
    <div className="demo-notice" role="note">
      <FlaskConical size={18} aria-hidden="true" />
      <span>Entorno de desarrollo: los eventos visibles son demostrativos y no constituyen información oficial.</span>
    </div>
  );
}
