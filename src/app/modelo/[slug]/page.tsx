import { notFound } from "next/navigation";
import { getModelo, productsByModelo, MODELOS } from "@/lib/catalog";
import Listing from "@/components/Listing";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ p?: string }> };

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
  const page = Number((await searchParams).p || 1);
  return <Listing eyebrow="Modelo" title={`Mercedes-Benz ${m.nombre}`} items={productsByModelo(m.slug)} base={`/modelo/${m.slug}`} page={page} intro="según la aplicación declarada en cada ficha" />;
}
