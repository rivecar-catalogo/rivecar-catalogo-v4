import { SUCURSALES, HORARIO } from "@/lib/catalog";
export const metadata = { title: "Sucursales" };
export default function SucursalesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="eyebrow text-red">Red física</div>
      <h1 className="text-3xl font-extrabold text-navy mt-1">Cinco sucursales a lo largo de Chile</h1>
      <p className="text-muted mt-1">{HORARIO}. Retira tu cotización en la sucursal más cercana o pide despacho.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {SUCURSALES.map((s) => (
          <div key={s.nombre} className="card p-5">
            <div className="font-extrabold text-navy text-lg">{s.nombre}</div>
            <div className="text-sm mt-2">{s.direccion}</div>
            <div className="text-sm text-muted">{s.ciudad}</div>
            <div className="text-sm mt-2 mono">{s.telefono}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
