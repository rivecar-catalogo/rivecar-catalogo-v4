import Link from "next/link";
import type { Product } from "@/lib/catalog";
import ProductCard from "./ProductCard";

const PAGE = 48;

export default function Listing({ title, eyebrow, items, base, page, intro }: { title: string; eyebrow: string; items: Product[]; base: string; page: number; intro?: string }) {
  const pages = Math.max(1, Math.ceil(items.length / PAGE));
  const cur = Math.min(Math.max(1, page), pages);
  const slice = items.slice((cur - 1) * PAGE, cur * PAGE);
  const link = (n: number) => `${base}${n > 1 ? `?p=${n}` : ""}`;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="eyebrow text-red">{eyebrow}</div>
      <h1 className="text-3xl font-extrabold text-navy mt-1">{title}</h1>
      <p className="text-muted mt-1">{items.length.toLocaleString("es-CL")} productos{intro ? ` · ${intro}` : ""}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        {slice.map((p) => <ProductCard key={p.codigo} p={p} />)}
      </div>
      {pages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-8 text-sm">
          {cur > 1 && <Link className="btn-ghost" href={link(cur - 1)}>‹ Anterior</Link>}
          <span className="text-muted">Página {cur} de {pages}</span>
          {cur < pages && <Link className="btn-ghost" href={link(cur + 1)}>Siguiente ›</Link>}
        </nav>
      )}
    </div>
  );
}
