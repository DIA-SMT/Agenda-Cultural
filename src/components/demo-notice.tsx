import { FlaskConical } from "lucide-react";

export function DemoNotice() {
  return (
    <div className="demo-notice" role="note">
      <FlaskConical size={18} aria-hidden="true" />
      <span>Entorno de desarrollo: los eventos visibles son demostrativos y no constituyen información oficial.</span>
    </div>
  );
}
