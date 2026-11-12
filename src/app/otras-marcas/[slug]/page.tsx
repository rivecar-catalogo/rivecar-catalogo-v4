import { notFound } from "next/navigation";
import { getOtra, productsByOtra, OTRAS } from "@/lib/catalog";
import Listing from "@/components/Listing";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ p?: string; orden?: string; stock?: string }> };
export function generateStaticParams() { return OTRAS.map((m) => ({ slug: m.slug })); }
export async function generateMetadata({ params }: Props) {
  const m = getOtra((await params).slug);
  return { title: m ? `Repuestos para ${m.nombre}` : "Otras marcas" };
}
export default async function OtraPage({ params, searchParams }: Props) {
  const m = getOtra((await params).slug);
  if (!m) notFound();
  const sp = await searchParams; const page = Number(sp.p || 1);
  return <Listing eyebrow="Otras marcas" title={m.nombre} items={productsByOtra(m.slug)} base={`/otras-marcas/${m.slug}`} page={page} orden={sp.orden} stock={sp.stock} intro="según la aplicación escrita en el sistema de Rivecar; confirmar con la referencia y el vehículo" />;
}
