import CotizarClient from "./CotizarClient";
export const metadata = { title: "Cotización" };
export default function CotizarPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="eyebrow text-red">Tu lista</div>
      <h1 className="text-3xl font-extrabold text-navy mt-1">Cotización</h1>
      <p className="text-muted mt-1">Revisa las cantidades y envíala por WhatsApp. Te respondemos con precio, disponibilidad por sucursal y plazo de despacho.</p>
      <CotizarClient />
    </div>
  );
}
