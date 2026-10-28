"use client";
import { useState } from "react";
/** Imagen con respaldo: si el enlace externo (Drive/SIVO) no carga, muestra el marcador. */
export default function Img({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  const [ok, setOk] = useState(true);
  if (!src || !ok) return <span className="eyebrow text-muted">Sin imagen</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className={className} onError={() => setOk(false)} referrerPolicy="no-referrer" />;
}
