import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { MODELOS, SHOW_STOCK } from "@/lib/catalog";
import { decodeChasis, decodeMotor, vehiculoPorModelo, vehiculoPorPatente, productosParaVehiculo, PATENTES_TOTAL, EJES, FRENOS, ORDENES, type Vehiculo } from "@/lib/vehiculo";

export const metadata: Metadata = { title: "Buscar por vehículo", description: "Escriba el número de chasis o elija el modelo: el catálogo muestra solo lo que aplica." };

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";
const PAGE = 48;

export default async function VehiculoPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const chasis = one(sp.chasis).trim();
  const patente = one(sp.patente).trim();
  const motorIn = one(sp.motor).trim();
  const modelo = one(sp.modelo);
  const anio = parseInt(one(sp.anio)) || undefined;
  const f = { cat: one(sp.cat) || undefined, eje: one(sp.eje) || undefined, freno: one(sp.freno) || undefined, q: one(sp.q) || undefined, orden: one(sp.orden) || undefined, stock: one(sp.stock) || undefined };
  const page = parseInt(one(sp.p)) || 1;

  let v: Vehiculo | null = null;
  let error = "";
  if (chasis) { v = decodeChasis(chasis); if (!v) error = "No reconozco ese número de chasis. Revise que tenga 17 caracteres y empiece por 9BM, WDB, W1T, 8AC o similar; si no, elija el modelo a mano."; }
  else if (patente) { v = vehiculoPorPatente(patente); if (!v) error = `La patente ${patente.toUpperCase()} no está entre los ${PATENTES_TOTAL.toLocaleString("es-CL")} vehículos Mercedes-Benz inscritos en Chile entre 1985 y septiembre de 2026 que conoce el catálogo (o no es Mercedes-Benz). Pruebe con el chasis o elija el modelo a mano.`; }
  else if (modelo) { v = vehiculoPorModelo(modelo, anio); }
  if (v && motorIn) { const m = decodeMotor(motorIn); if (m) { v.motor = m.motor; v.motorFam = m.motorFam; } }
  if (v && !v.motorFam && v.motoresProbables.length === 1 && (v.chasis || v.modeloNum?.length)) { v.motorFam = v.motoresProbables[0]; }

  const res = v ? productosParaVehiculo(v, f) : null;
  const pages = res ? Math.max(1, Math.ceil(res.items.length / PAGE)) : 1;
  const cur = Math.min(Math.max(1, page), pages);
  const slice = res ? res.items.slice((cur - 1) * PAGE, cur * PAGE) : [];
  const keep = (over: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const all: Record<string, string | undefined> = { chasis: chasis || undefined, patente: patente || undefined, motor: motorIn || undefined, modelo: modelo || undefined, anio: anio ? String(anio) : undefined, cat: f.cat, eje: f.eje, freno: f.freno, q: f.q, orden: f.orden, stock: f.stock, ...over };
    Object.entries(all).forEach(([k, val]) => { if (val) q.set(k, val); });
    return `/vehiculo?${q.toString()}`;
  };
  const esFrenos = f.cat === "Frenos Y Dirección" || f.cat === "Chasis Y Ejes";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="eyebrow text-red">Buscar por vehículo</div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-navy mt-1">Del camión a la pieza, sin saber el número de parte</h1>
      <p className="text-muted mt-2 max-w-3xl">Escriba la patente, o el número de chasis (está en el permiso de circulación y en la placa del chasis) y, si lo tiene, el número de motor. El catálogo identifica la familia, la serie y el motor, y muestra solo lo que aplica. Si no tiene ninguno, elija el modelo.</p>

      <form className="card p-4 mt-6 grid gap-3 md:grid-cols-[0.8fr_1.4fr_1fr_auto]" action="/vehiculo" method="get">
        <label className="text-sm">
          <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Patente</span>
          <input name="patente" defaultValue={patente} placeholder="RKXL39" className="w-full border border-line rounded-md px-3 py-2 mono uppercase" autoComplete="off" maxLength={8} />
        </label>
        <label className="text-sm">
          <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">N° de chasis (VIN)</span>
          <input name="chasis" defaultValue={chasis} placeholder="9BM958154PB300457" className="w-full border border-line rounded-md px-3 py-2 mono" autoComplete="off" />
        </label>
        <label className="text-sm">
          <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">N° de motor (opcional)</span>
          <input name="motor" defaultValue={motorIn} placeholder="926994U1414359" className="w-full border border-line rounded-md px-3 py-2 mono" autoComplete="off" />
        </label>
        <div className="flex items-end"><button className="btn-red h-11 w-full md:w-auto" type="submit">Identificar</button></div>
        <details className="md:col-span-4 text-sm">
          <summary className="cursor-pointer text-navy font-semibold">No tengo el chasis: elegir el modelo a mano</summary>
          <div className="mt-2 flex flex-wrap gap-2 items-end">
            <label>
              <span className="block text-xs text-muted mb-1">Modelo</span>
              <select name="modelo" defaultValue={modelo} className="border border-line rounded-md px-3 py-2">
                <option value="">Elegir…</option>
                {MODELOS.map((m) => <option key={m.slug} value={m.slug}>{m.nombre}</option>)}
              </select>
            </label>
            <label>
              <span className="block text-xs text-muted mb-1">Año (opcional)</span>
              <input name="anio" defaultValue={anio || ""} placeholder="2017" className="border border-line rounded-md px-3 py-2 w-24" />
            </label>
            <button className="btn-navy h-10" type="submit" formAction="/vehiculo">Ver piezas</button>
          </div>
        </details>
      </form>

      {error && <p className="mt-4 text-sm text-red font-semibold">{error}</p>}

      {v && res && (
        <>
          <section className="mt-6 card p-5 bg-tint">
            <div className="eyebrow text-muted">Vehículo identificado</div>
            <h2 className="text-xl font-extrabold text-navy mt-1">Mercedes-Benz {v.familia}</h2>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-4">
              {v.serie && <><dt className="text-muted">Serie (Baumuster)</dt><dd className="mono font-semibold">{v.serie}</dd></>}
              {v.anioModelo && <><dt className="text-muted">Año modelo</dt><dd className="font-semibold">{v.anioModelo}</dd></>}
              {v.origen && <><dt className="text-muted">Origen</dt><dd className="font-semibold">{v.origen}</dd></>}
              <dt className="text-muted">Motor</dt><dd className="font-semibold">{v.motor || (v.motoresProbables.length ? `Probable: ${v.motoresProbables.join(" o ")}` : "Sin dato")}</dd>
            </dl>
            {v.confirmado && <p className="text-xs text-muted mt-2">Series confirmadas con chasis reales: {v.confirmado}.</p>}
            {v.nota && <p className="text-xs text-muted mt-2">{v.nota}</p>}
            {patente && v.modeloNum && v.modeloNum.length > 0 && <p className="text-xs text-muted mt-2">Además de la familia, se incluyen los productos cuya aplicación nombra el modelo {v.modeloNum.join(" o ")} (por ejemplo «814/914»), aunque estén clasificados en otra familia del catálogo.</p>}
            {patente && <p className="text-xs text-muted mt-2">Patente {patente.toUpperCase()} según el registro público de inscripciones (Registro Civil, 1985 a septiembre de 2026). El registro no trae chasis ni motor.</p>}
            <p className="text-xs text-muted mt-2">La familia y el motor acotan la búsqueda; la pieza exacta se confirma con la referencia Mercedes-Benz de la ficha y, en frenos y ejes, con la posición y el tipo de freno.</p>
          </section>

          <section className="mt-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-extrabold text-navy">{res.total.toLocaleString("es-CL")} productos para este vehículo{res.porMotor || res.porModelo ? <span className="text-sm text-muted font-normal"> · {[res.porMotor ? `${res.porMotor} nombran su motor` : "", res.porModelo ? `${res.porModelo.toLocaleString("es-CL")} nombran el modelo ${res.modeloNum.join("/")}` : ""].filter(Boolean).join(" y ")}: van primero</span> : null}</h2>
              <form action="/vehiculo" method="get" className="flex flex-wrap gap-2 items-center">
                {chasis && <input type="hidden" name="chasis" value={chasis} />}{patente && <input type="hidden" name="patente" value={patente} />}{motorIn && <input type="hidden" name="motor" value={motorIn} />}{modelo && <input type="hidden" name="modelo" value={modelo} />}{anio && <input type="hidden" name="anio" value={anio} />}{f.cat && <input type="hidden" name="cat" value={f.cat} />}{f.eje && <input type="hidden" name="eje" value={f.eje} />}{f.freno && <input type="hidden" name="freno" value={f.freno} />}
                <input name="q" defaultValue={f.q} placeholder="Filtrar: pastilla, filtro, correa…" className="border border-line rounded-md px-3 py-1.5 text-sm" />
                <label className="text-sm text-muted flex items-center gap-1">Ordenar
                  <select name="orden" defaultValue={f.orden || "venta"} className="border border-line rounded-md px-2 py-1.5 text-sm text-navy">
                    {ORDENES.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                  </select>
                </label>
                {SHOW_STOCK && <label className="text-sm text-navy flex items-center gap-1"><input type="checkbox" name="stock" value="1" defaultChecked={f.stock === "1"} /> Solo con stock</label>}
                <button className="btn-ghost text-sm" type="submit">Aplicar</button>
              </form>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={keep({ cat: undefined, eje: undefined, freno: undefined, q: undefined })} className={`chip ${!f.cat ? "on" : ""}`}>Todo · {res.total}</Link>
              {res.cats.map((c) => <Link key={c.cat} href={keep({ cat: c.cat, eje: undefined, freno: undefined })} className={`chip ${f.cat === c.cat ? "on" : ""}`}>{c.cat} · {c.n}</Link>)}
            </div>
            {esFrenos && (
              <div className="mt-3 flex flex-wrap gap-2 items-center text-sm">
                <span className="text-muted">Dos preguntas para cerrar:</span>
                {EJES.map(([k, label]) => <Link key={k} href={keep({ eje: f.eje === k ? undefined : k })} className={`chip ${f.eje === k ? "on" : ""}`}>{label}</Link>)}
                <span className="text-muted mx-1">·</span>
                {FRENOS.map(([k, label]) => <Link key={k} href={keep({ freno: f.freno === k ? undefined : k })} className={`chip ${f.freno === k ? "on" : ""}`}>{label}</Link>)}
              </div>
            )}
            <p className="text-sm text-muted mt-3">{res.items.length.toLocaleString("es-CL")} resultados{f.cat ? ` en ${f.cat.toLowerCase()}` : ""}{f.q ? ` con «${f.q}»` : ""}{f.stock === "1" ? " con stock" : SHOW_STOCK ? ` · ${res.conStock.toLocaleString("es-CL")} con stock` : ""}{f.orden && f.orden !== "venta" ? ` · orden: ${(ORDENES.find((o) => o[0] === f.orden)?.[1] || "").toLowerCase()}` : " · los más vendidos primero"}.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
              {slice.map((p) => <ProductCard key={p.codigo} p={p} />)}
            </div>
            {pages > 1 && (
              <nav className="flex items-center justify-center gap-2 mt-8 text-sm">
                {cur > 1 && <Link className="btn-ghost" href={keep({}) + `&p=${cur - 1}`}>‹ Anterior</Link>}
                <span className="text-muted">Página {cur} de {pages}</span>
                {cur < pages && <Link className="btn-ghost" href={keep({}) + `&p=${cur + 1}`}>Siguiente ›</Link>}
              </nav>
            )}
          </section>
        </>
      )}

      {!v && !error && (
        <section className="mt-8 grid gap-4 md:grid-cols-3 text-sm">
          <div className="card p-4"><div className="font-bold text-navy">1 · Pida la patente o el chasis</div><p className="text-muted mt-1">Con la patente, el catálogo busca el modelo y el año en el registro público de vehículos Mercedes-Benz inscritos en Chile (1985 a 2026). Con el chasis (permiso de circulación, 17 caracteres) afina la serie y el motor.</p></div>
          <div className="card p-4"><div className="font-bold text-navy">2 · El catálogo lo identifica</div><p className="text-muted mt-1">De los dígitos 4 a 9 sale la serie Mercedes-Benz (por ejemplo 958.154 = Atego Brasil); de la letra 10, el año modelo; del número de motor, el motor exacto.</p></div>
          <div className="card p-4"><div className="font-bold text-navy">3 · Elija la categoría y cierre</div><p className="text-muted mt-1">Frenos, motor, suspensión… y dos preguntas que cualquiera puede responder mirando el camión: ¿eje delantero o trasero? ¿disco o tambor?</p></div>
        </section>
      )}
    </div>
  );
}
