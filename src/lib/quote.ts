"use client";
/** Lista de cotización guardada en el navegador del cliente (prototipo). */
export type QuoteItem = { codigo: string; descripcion: string; oem: string; cantidad: number };

const KEY = "rivecar.cotizacion";

export function readQuote(): QuoteItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function writeQuote(items: QuoteItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("rivecar:quote"));
  } catch {}
}

export function addToQuote(item: Omit<QuoteItem, "cantidad">, cantidad = 1) {
  const items = readQuote();
  const found = items.find((i) => i.codigo === item.codigo);
  if (found) found.cantidad += cantidad;
  else items.push({ ...item, cantidad });
  writeQuote(items);
  return items;
}

export function whatsappUrl(items: QuoteItem[], extra = "") {
  const number = process.env.NEXT_PUBLIC_WHATSAPP || "";
  const lines = items.map((i) => `• ${i.cantidad} × ${i.codigo} — ${i.descripcion}${i.oem ? ` (OEM ${i.oem})` : ""}`);
  const text = `Hola Rivecar, quiero cotizar:\n${lines.join("\n")}${extra ? `\n\n${extra}` : ""}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
