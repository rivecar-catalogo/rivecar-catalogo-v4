import Link from "next/link";
import { OTRAS, PRODUCTS } from "@/lib/catalog";
export const metadata = { title: "Otras marcas" };
export default function OtrasPage() {
  const total = PRODUCTS.filter((p) => p.otras && p.otras.length).length;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="eyebrow text-red">Catálogo</div>
      <h1 className="text-3xl font-extrabold text-navy mt-1">Repuestos que también sirven en otras marcas</h1>
      <p className="text-muted mt-1">{total.toLocaleString("es-CL")} productos cuya aplicación, según el sistema de Rivecar, nombra además un vehículo o motor que no es Mercedes-Benz. Es lo que Rivecar ya vende a esas marcas; la compatibilidad de cada pieza se confirma con la referencia y el vehículo.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {OTRAS.map((m) => (
          <Link key={m.slug} href={`/otras-marcas/${m.slug}`} className="card p-4 hover:shadow-md flex items-center justify-between">
            <span className="font-semibold text-navy">{m.nombre}</span>
            <span className="text-xs text-muted mono">{m.n}</span>
          </Link>
        ))}
      </div>
      <p className="text-xs text-muted mt-6">Los fabricantes de buena parte del catálogo (Knorr, Wabco, Sachs, ZF, Hengst, Mahle, SKF, Dayco, Bosch y otros) también abastecen a Volvo, Scania, VW, Iveco y MAN. Las aplicaciones de esas piezas en otras marcas se van agregando a medida que se verifican en el catálogo de cada fabricante.</p>
    </div>
  );
}
