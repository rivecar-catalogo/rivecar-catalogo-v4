import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoria, productsByCat, CATEGORIAS } from "@/lib/catalog";
import Listing from "@/components/Listing";

type Props = { params: Promise<{ cat: string }>; searchParams: Promise<{ p?: string }> };
export function generateStaticParams() { return CATEGORIAS.map((c) => ({ cat: c.slug })); }
export async function generateMetadata({ params }: Props) {
  const c = getCategoria((await params).cat);
  return { title: c ? `${c.nombre} · repuestos Mercedes-Benz` : "Categoría" };
}
export default async function CatPage({ params, searchParams }: Props) {
  const c = getCategoria((await params).cat);
  if (!c) notFound();
  const page = Number((await searchParams).p || 1);
  const subs = c.sub.filter((s) => s.nombre);
  return (
    <>
      {subs.length > 1 && (
        <div className="mx-auto max-w-6xl px-4 pt-8 flex flex-wrap gap-2">
          {subs.map((s) => <Link key={s.slug} href={`/categoria/${c.slug}/${s.slug}`} className="chip">{s.nombre} <span className="text-muted">· {s.n}</span></Link>)}
        </div>
      )}
      <Listing eyebrow="Categoría" title={c.nombre} items={productsByCat(c.slug)} base={`/categoria/${c.slug}`} page={page} />
    </>
  );
}
