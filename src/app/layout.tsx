import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agente IA ITSM Enterprise | SONDA",
  description: "Demo enterprise de agente IA operacional para gestión ITSM basada en ITIL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
