import Link from "next/link";
import { SUCURSALES, HORARIO, VERSION } from "@/lib/catalog";

export default function Footer() {
  return (
    <footer className="mt-16 bg-navy text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <div className="eyebrow text-white/60 mb-2">Rivecar S.A.</div>
          <p className="text-white/80">Importación directa de repuestos Mercedes-Benz para camión, bus y Sprinter. Más de 20 años de experiencia técnica.</p>
          <p className="mt-3 text-white/60">{HORARIO}</p>
        </div>
        <div>
          <div className="eyebrow text-white/60 mb-2">Sucursales</div>
          <ul className="space-y-1 text-white/80">
            {SUCURSALES.map((s) => (
              <li key={s.nombre}>{s.nombre} · {s.telefono}</li>
            ))}
          </ul>
          <Link href="/sucursales" className="inline-block mt-2 text-white underline underline-offset-4">Ver direcciones</Link>
        </div>
        <div>
          <div className="eyebrow text-white/60 mb-2">Sobre este sitio</div>
          <p className="text-white/80">Capa de búsqueda del catálogo Rivecar: 13.102 productos del sistema, con referencias Mercedes-Benz y navegación por modelo. La compra se completa en la tienda Rivecar; la disponibilidad se confirma allí o por cotización.</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 text-[11px] tracking-widest uppercase text-white/50 flex justify-between">
          <span>© {new Date().getFullYear()} Rivecar</span>
          <span>Prototipo {VERSION} · Soportek × Connectek</span>
        </div>
      </div>
    </footer>
  );
}
