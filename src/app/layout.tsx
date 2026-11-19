import type { Metadata } from "next";
import { Manrope, Source_Sans_3 } from "next/font/google";
import { MigueChat } from "@/components/migue-chat";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const display = Manrope({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Source_Sans_3({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Agenda Cultural SMT", template: "%s | Agenda Cultural SMT" },
  description: "Eventos, cultura y experiencias para disfrutar San Miguel de Tucumán.",
  applicationName: "Agenda Cultural SMT",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Agenda Cultural SMT",
    title: "Agenda Cultural SMT",
    description: "Encontrá tu próximo plan en San Miguel de Tucumán.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body className={`${display.variable} ${body.variable}`}>
        <SiteHeader />
        <main id="contenido">{children}</main>
        <SiteFooter />
        <MigueChat />
      </body>
    </html>
  );
}
