import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: "Rivecar · Repuestos Mercedes-Benz", template: "%s · Rivecar" },
  description: "Catálogo de repuestos Mercedes-Benz para camión, bus y Sprinter. Busca por número de parte, OEM o modelo. Cinco sucursales y despacho a todo Chile.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
