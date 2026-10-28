import Link from "next/link";
import { MODELOS } from "@/lib/catalog";
export const metadata = { title: "Modelos" };
export default function ModelosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="eyebrow text-red">Catálogo</div>
      <h1 className="text-3xl font-extrabold text-navy mt-1">Repuestos por modelo</h1>
      <p className="text-muted mt-1">Agrupados según la aplicación declarada en cada ficha. Una pieza puede aparecer en varios modelos.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {MODELOS.map((m) => (
          <Link key={m.slug} href={`/modelo/${m.slug}`} className="card p-4 hover:shadow-md flex items-center justify-between">
            <span className="font-semibold text-navy">Mercedes-Benz {m.nombre}</span>
            <span className="text-xs text-muted mono">{m.n}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
