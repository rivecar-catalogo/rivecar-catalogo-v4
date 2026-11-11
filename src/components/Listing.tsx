import Link from "next/link";
import { ORDENES, ordenLabel, ordenar, stockTotal, SHOW_STOCK, type Product } from "@/lib/catalog";
import ProductCard from "./ProductCard";

const PAGE = 48;
export type ListSP = { p?: string; orden?: string; stock?: string };

export default function Listing({ title, eyebrow, items, base, page, intro, orden, stock }: { title: string; eyebrow: string; items: Product[]; base: string; page: number; intro?: string; orden?: string; stock?: string }) {
  const conStock = items.filter((p) => stockTotal(p) > 0).length;
  let list = stock === "1" ? items.filter((p) => stockTotal(p) > 0) : items;
  list = ordenar(list, orden);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const cur = Math.min(Math.max(1, page), pages);
  const slice = list.slice((cur - 1) * PAGE, cur * PAGE);
  const link = (n: number) => { const q = new URLSearchParams(); if (n > 1) q.set("p", String(n)); if (orden && orden !== "venta") q.set("orden", orden); if (stock === "1") q.set("stock", "1"); const qs = q.toString(); return `${base}${qs ? `?${qs}` : ""}`; };
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="eyebrow text-red">{eyebrow}</div>
      <h1 className="text-3xl font-extrabold text-navy mt-1">{title}</h1>
      <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
        <p className="text-muted">{list.length.toLocaleString("es-CL")} productos{stock === "1" ? " con stock" : SHOW_STOCK && conStock < items.length ? ` · ${conStock.toLocaleString("es-CL")} con stock` : ""}{intro ? ` · ${intro}` : ""}{orden && orden !== "venta" ? ` · orden: ${ordenLabel(orden).toLowerCase()}` : " · los más vendidos primero"}</p>
        <form action={base} method="get" className="flex flex-wrap gap-2 items-center">
          <label className="text-sm text-muted flex items-center gap-1">Ordenar
            <select name="orden" defaultValue={orden || "venta"} className="border border-line rounded-md px-2 py-1.5 text-sm text-navy bg-white">
              {ORDENES.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </label>
          {SHOW_STOCK && <label className="text-sm text-navy flex items-center gap-1"><input type="checkbox" name="stock" value="1" defaultChecked={stock === "1"} /> Solo con stock</label>}
          <button className="btn-ghost text-sm" type="submit">Aplicar</button>
        </form>
      </div>
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
