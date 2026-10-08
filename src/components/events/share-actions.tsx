"use client";

import { Check, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";

export function ShareActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function shareWhatsapp() {
    const href = `https://wa.me/?text=${encodeURIComponent(`${title} — ${window.location.href}`)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="share-actions" aria-label="Compartir evento">
      <button className="button button-secondary" type="button" onClick={shareWhatsapp}><MessageCircle size={18} /> WhatsApp</button>
      <button className="button button-secondary" type="button" onClick={copyLink}>{copied ? <Check size={18} /> : <Copy size={18} />}{copied ? "Copiado" : "Copiar enlace"}</button>
    </div>
  );
}
