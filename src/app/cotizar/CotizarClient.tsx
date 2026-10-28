"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { readQuote, writeQuote, whatsappUrl, type QuoteItem } from "@/lib/quote";
import { track } from "@/lib/analytics";

export default function CotizarClient() {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [sucursal, setSucursal] = useState("Maipú");
  const [vin, setVin] = useState("");
  useEffect(() => setItems(readQuote()), []);
  const upd = (next: QuoteItem[]) => { setItems(next); writeQuote(next); };
  if (items.length === 0)
    return (
      <div className="card p-6 mt-6 bg-tint">
        <p className="font-semibold text-navy">Tu lista está vacía.</p>
        <p className="text-sm text-muted mt-1">Busca un repuesto y pulsa “Agregar a cotización”.</p>
        <Link href="/" className="btn-navy mt-4">Ir al buscador</Link>
      </div>
    );
  const extra = [nombre && `Nombre: ${nombre}`, empresa && `Empresa: ${empresa}`, vin && `VIN / chasis o patente: ${vin.trim().toUpperCase()}`, `Retiro/despacho: ${sucursal}`].filter(Boolean).join("\n");
  return (
    <div className="mt-6 grid gap-6">
      <ul className="card divide-y divide-line">
        {items.map((i) => (
          <li key={i.codigo} className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="font-semibold text-navy">{i.descripcion}</div>
              <div className="mono text-sm text-muted">{i.codigo}{i.oem ? ` · OEM ${i.oem}` : ""}</div>
            </div>
            <input
              className="w-16 h-10 border border-line rounded text-center mono"
              value={i.cantidad}
              onChange={(e) => upd(items.map((x) => (x.codigo === i.codigo ? { ...x, cantidad: Math.max(1, Number(e.target.value) || 1) } : x)))}
            />
            <button className="text-muted hover:text-red text-sm" onClick={() => upd(items.filter((x) => x.codigo !== i.codigo))}>Quitar</button>
          </li>
        ))}
      </ul>
      <div className="card p-4 grid gap-3 sm:grid-cols-3">
        <input className="h-11 border border-line rounded px-3" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input className="h-11 border border-line rounded px-3" placeholder="Empresa (opcional)" value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
        <select className="h-11 border border-line rounded px-3 bg-white" value={sucursal} onChange={(e) => setSucursal(e.target.value)}>
          {["Maipú", "Talagante", "Talca", "Coquimbo", "Concepción", "Despacho a domicilio"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="card p-4">
        <label className="text-sm font-semibold text-navy" htmlFor="vin">VIN / número de chasis o patente del vehículo</label>
        <input id="vin" className="mt-2 h-11 w-full border border-line rounded px-3 mono uppercase" placeholder="Ej.: WDB9302031L123456 o patente" value={vin} onChange={(e) => setVin(e.target.value)} />
        <p className="text-xs text-muted mt-1">Opcional, pero recomendado: con el VIN confirmamos que el repuesto corresponde exactamente a tu vehículo.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <a className="btn-red h-12 text-base" href={whatsappUrl(items, extra)} target="_blank" rel="noopener" onClick={() => track("enviar_cotizacion", { n: items.length })}>
          Enviar cotización por WhatsApp
        </a>
        <button className="btn-ghost h-12" onClick={() => upd([])}>Vaciar lista</button>
      </div>
      <p className="text-xs text-muted">La lista se guarda solo en este navegador. En la versión transaccional, aquí irá el carrito con precio, stock por sucursal y pago.</p>
    </div>
  );
}
