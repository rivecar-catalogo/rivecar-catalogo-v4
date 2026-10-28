"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBox({ big = false }: { big?: boolean }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
      }}
      className={`flex items-stretch rounded-lg border border-line overflow-hidden bg-white ${big ? "shadow-lg" : ""}`}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Número de parte, código Rivecar, OEM, nombre o modelo"
        className={`flex-1 px-4 outline-none text-ink ${big ? "h-14 text-lg" : "h-10 text-sm"}`}
        aria-label="Buscar repuesto"
      />
      <button type="submit" className={`bg-red text-white font-bold px-5 ${big ? "text-base" : "text-sm"}`}>
        Buscar
      </button>
    </form>
  );
}
