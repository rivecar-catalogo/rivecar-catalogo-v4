"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readQuote } from "@/lib/quote";
import { initAnalytics } from "@/lib/analytics";

export default function QuoteBadge() {
  const [n, setN] = useState(0);
  useEffect(() => {
    initAnalytics();
    const upd = () => setN(readQuote().reduce((a, i) => a + i.cantidad, 0));
    upd();
    window.addEventListener("rivecar:quote", upd);
    return () => window.removeEventListener("rivecar:quote", upd);
  }, []);
  return (
    <Link href="/cotizar" className="btn-navy !py-2 !px-3 text-sm">
      Cotización
      <span className="bg-red rounded-full min-w-6 h-6 px-1 grid place-items-center text-xs">{n}</span>
    </Link>
  );
}
