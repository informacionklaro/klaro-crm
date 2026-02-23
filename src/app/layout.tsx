import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Klaro CRM",
  description: "Tus ventas y cobros bajo control. Sin enredos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
