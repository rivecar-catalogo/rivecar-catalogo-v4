import { notFound } from "next/navigation";
import { getCategoria, getSub, productsByCat, CATEGORIAS } from "@/lib/catalog";
import Listing from "@/components/Listing";

type Props = { params: Promise<{ cat: string; sub: string }>; searchParams: Promise<{ p?: string }> };
export function generateStaticParams() { return CATEGORIAS.flatMap((c) => c.sub.filter((s) => s.slug).map((s) => ({ cat: c.slug, sub: s.slug }))); }
export async function generateMetadata({ params }: Props) {
  const { cat, sub } = await params; const s = getSub(cat, sub);
  return { title: s ? `${s.nombre} · repuestos Mercedes-Benz` : "Categoría" };
}
export default async function SubPage({ params, searchParams }: Props) {
  const { cat, sub } = await params; const c = getCategoria(cat); const s = getSub(cat, sub);
  if (!c || !s) notFound();
  const page = Number((await searchParams).p || 1);
  return <Listing eyebrow={c.nombre} title={s.nombre} items={productsByCat(c.slug, s.slug)} base={`/categoria/${c.slug}/${s.slug}`} page={page} />;
}
