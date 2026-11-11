import { notFound } from "next/navigation";
import { getModelo, productsByModelo, MODELOS } from "@/lib/catalog";
import Listing from "@/components/Listing";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ p?: string; orden?: string; stock?: string }> };

export function generateStaticParams() {
  return MODELOS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props) {
  const m = getModelo((await params).slug);
  return { title: m ? `Repuestos Mercedes-Benz ${m.nombre}` : "Modelo" };
}

export default async function ModeloPage({ params, searchParams }: Props) {
  const m = getModelo((await params).slug);
  if (!m) notFound();
  const sp = await searchParams; const page = Number(sp.p || 1);
  return <Listing eyebrow="Modelo" title={`Mercedes-Benz ${m.nombre}`} items={productsByModelo(m.slug)} base={`/modelo/${m.slug}`} page={page} orden={sp.orden} stock={sp.stock} intro="según la aplicación declarada en cada ficha" />;
}
