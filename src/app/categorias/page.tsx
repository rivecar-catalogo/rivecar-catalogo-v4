import Link from "next/link";
import { CATEGORIAS } from "@/lib/catalog";
export const metadata = { title: "Categorías" };
export default function CategoriasPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="eyebrow text-red">Catálogo</div>
      <h1 className="text-3xl font-extrabold text-navy mt-1">Categorías</h1>
      <p className="text-muted mt-1">Las mismas diez categorías de la tienda Rivecar, con sus subcategorías.</p>
      <div className="grid gap-4 sm:grid-cols-2 mt-6">
        {CATEGORIAS.map((c) => (
          <div key={c.slug} className="card p-4">
            <Link href={`/categoria/${c.slug}`} className="font-extrabold text-navy text-lg hover:text-red">{c.nombre} <span className="text-xs text-muted mono">{c.n}</span></Link>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.sub.filter((s) => s.nombre).map((s) => <Link key={s.slug} href={`/categoria/${c.slug}/${s.slug}`} className="chip">{s.nombre} <span className="text-muted">· {s.n}</span></Link>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
