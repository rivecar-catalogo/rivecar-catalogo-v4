"use client";
import { useState } from "react";
import { addToQuote, whatsappUrl } from "@/lib/quote";
import { track } from "@/lib/analytics";

export default function QuoteButton({ codigo, descripcion, oem }: { codigo: string; descripcion: string; oem: string }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const item = { codigo, descripcion, oem };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center border border-line rounded-lg overflow-hidden">
        <button className="px-3 h-11 text-lg" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="menos">−</button>
        <input className="w-12 text-center h-11 outline-none mono" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
        <button className="px-3 h-11 text-lg" onClick={() => setQty(qty + 1)} aria-label="más">+</button>
      </div>
      <button
        className="btn-navy h-11"
        onClick={() => {
          addToQuote(item, qty);
          setAdded(true);
          track("agregar_cotizacion", { codigo, qty });
          setTimeout(() => setAdded(false), 1500);
        }}
      >
        {added ? "Agregado ✓" : "Agregar a cotización"}
      </button>
      <a
        className="btn-red h-11"
        href={whatsappUrl([{ ...item, cantidad: qty }])}
        target="_blank"
        rel="noopener"
        onClick={() => track("cotizar_whatsapp", { codigo, qty })}
      >
        Cotizar por WhatsApp
      </a>
    </div>
  );
}
