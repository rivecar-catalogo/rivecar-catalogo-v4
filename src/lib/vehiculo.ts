import data from "@/data/vehiculos.json";
import patentes from "@/data/patentes.json";
import { PRODUCTS, MODELOS, popRank, stockTotal, type Product } from "@/lib/catalog";

type Serie = { familia: string; slug: string; origen: string; motores: string[]; confirmado: string; sub?: Record<string, { familia: string; slug: string; motores: string[] }> };
const SERIES = data.series as Record<string, Serie>;
const MOTORES = data.motores as Record<string, string>;
const WMI = data.wmi as Record<string, string>;
const ANIOS = data.anios as Record<string, number>;
const PATENTES = patentes as unknown as Record<string, [string, number, string, string]>;

export type Vehiculo = {
  entrada: string;
  chasis?: string;
  serie?: string;        // Baumuster de 6 dígitos (958154)
  serieFam?: string;     // 3 primeros (958)
  familia: string;
  slug: string;
  origen?: string;
  anioModelo?: number;
  motor?: string;        // "OM 926 LA · 7,2 L"
  motorFam?: string;     // "OM 926"
  motoresProbables: string[];
  confirmado?: string;
  nota?: string;
};

const clean = (s: string) => (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

/** Decodifica un número de chasis Mercedes-Benz (17 caracteres) a familia, serie, origen y año modelo. */
export function decodeChasis(input: string): Vehiculo | null {
  const v = clean(input);
  if (v.length < 11) return null;
  const wmi = v.slice(0, 3);
  const bm = v.slice(3, 9);
  const fam3 = bm.slice(0, 3);
  const letraAnio = v.length === 17 ? v[9] : "";
  const s = SERIES[fam3];
  const origen = WMI[wmi];
  if (!s && !origen) return null;
  let familia = s?.familia || "Mercedes-Benz (serie no registrada todavía)";
  let slug = s?.slug || "";
  let motores = s?.motores || [];
  if (s?.sub && s.sub[bm[3]]) { familia = s.sub[bm[3]].familia; slug = s.sub[bm[3]].slug; motores = s.sub[bm[3]].motores; }
  const anio = /^[0-9]{6}$/.test(bm) && /[A-Z0-9]/.test(letraAnio) && ANIOS[letraAnio] && wmi !== "WDB" ? ANIOS[letraAnio] : undefined;
  return {
    entrada: input, chasis: v, serie: /^[0-9]{6}$/.test(bm) ? `${bm.slice(0, 3)}.${bm.slice(3)}` : undefined, serieFam: fam3,
    familia, slug, origen, anioModelo: anio, motoresProbables: motores, confirmado: s?.confirmado || "",
    nota: wmi === "WD4" ? "Chasis con formato de EE.UU.: no trae la serie Mercedes; se identifica por modelo." : !s ? "Serie no registrada en la tabla: el buscador muestra la marca, pero conviene elegir el modelo a mano." : undefined,
  };
}

/** Del número de motor saca la familia del motor (primeros 3 dígitos del Baumuster). */
export function decodeMotor(input: string): { motor: string; motorFam: string } | null {
  const m = clean(input);
  const mm = m.match(/^([0-9]{3})([0-9]{3})/);
  if (!mm) {
    if (m.startsWith("K9K")) return { motor: "Renault K9K 1,5 dCi (Citan)", motorFam: "K9K" };
    return null;
  }
  const fam = mm[1];
  const d = MOTORES[fam];
  if (!d) return null;
  return { motor: d, motorFam: "OM " + fam };
}

/** Busca la patente en el registro público de vehículos Mercedes-Benz inscritos en Chile (1985 a septiembre de 2026). */
export function vehiculoPorPatente(input: string): Vehiculo | null {
  const pat = clean(input);
  const r = PATENTES[pat];
  if (!r) return null;
  const [modelo, anio, tipo, slug] = r;
  const m = MODELOS.find((x) => x.slug === slug);
  const motores = slug ? [...new Set(Object.values(SERIES).filter((s) => s.slug === slug).flatMap((s) => s.motores))] : [];
  return {
    entrada: input, familia: `${modelo}${m ? ` · familia ${m.nombre}` : ""} (${tipo.toLowerCase()}${anio ? `, ${anio}` : ""})`, slug, anioModelo: anio || undefined,
    motoresProbables: motores, origen: undefined,
    nota: slug ? "Identificado por la patente en el registro público (modelo y año de fabricación). Para afinar la serie y el motor, agregue el número de chasis o de motor." : "La patente está en el registro, pero el modelo no coincide con ninguna familia del catálogo: elija el modelo a mano.",
  };
}
export const PATENTES_TOTAL = Object.keys(PATENTES).length;

/** Vehículo elegido a mano: modelo del prototipo + año. */
export function vehiculoPorModelo(slug: string, anio?: number): Vehiculo | null {
  const m = MODELOS.find((x) => x.slug === slug);
  if (!m) return null;
  const motores = Object.values(SERIES).filter((s) => s.slug === slug).flatMap((s) => s.motores);
  return { entrada: slug, familia: m.nombre, slug, anioModelo: anio, motoresProbables: [...new Set(motores)] };
}

export const EJES = [["del", "Eje delantero", /\b(DEL|DELANT|DELANTERO|DELANTERA|DIRECCION)\b/i], ["tras", "Eje trasero", /\b(TRAS|TRASERO|TRASERA|POST|TRASER)\b/i]] as const;
export const FRENOS = [["disco", "Freno de disco", /\b(DISCO|PASTILLA|PASTILLAS|CALIPER|CALIPE)\b/i], ["tambor", "Freno de tambor", /\b(TAMBOR|BALATA|BALATAS|ZAPATA|ZAPATAS|FORRO|REMACHE)\b/i]] as const;

export type Filtro = { cat?: string; eje?: string; freno?: string; q?: string; orden?: string; stock?: string };
export const ORDENES: [string, string][] = [["venta", "Más vendidos primero"], ["precio-desc", "Mayor precio"], ["precio-asc", "Menor precio"], ["stock", "Más disponibles"], ["nombre", "Nombre A–Z"], ["codigo", "Código Rivecar"]];

/** Productos que aplican al vehículo, ordenados: primero los que nombran su motor, después por venta. */
export function productosParaVehiculo(v: Vehiculo, f: Filtro): { items: Product[]; total: number; cats: { cat: string; n: number }[]; porMotor: number; conStock: number } {
  let base = v.slug ? PRODUCTS.filter((p) => p.modelos.includes(v.slug)) : [];
  if (v.motorFam) {
    const conMotor = PRODUCTS.filter((p) => p.om.includes(v.motorFam!) && !base.includes(p));
    base = [...base, ...conMotor];
  }
  const mf = v.motorFam;
  const score = (p: Product) => (mf && p.om.includes(mf) ? 0 : 1) * 10 + popRank(p);
  base.sort((a, b) => score(a) - score(b));
  const cats = Object.entries(base.reduce<Record<string, number>>((acc, p) => { acc[p.cat1] = (acc[p.cat1] || 0) + 1; return acc; }, {})).map(([cat, n]) => ({ cat, n })).sort((a, b) => b.n - a.n);
  let items = base;
  if (f.cat) items = items.filter((p) => p.cat1 === f.cat);
  if (f.q) { const q = f.q.toUpperCase(); items = items.filter((p) => (p.descripcion + " " + p.codigo + " " + p.refs.join(" ")).toUpperCase().includes(q)); }
  if (f.eje) { const rx = EJES.find((e) => e[0] === f.eje)?.[2]; if (rx) items = items.filter((p) => rx.test(p.descripcion)); }
  if (f.freno) { const rx = FRENOS.find((e) => e[0] === f.freno)?.[2]; if (rx) items = items.filter((p) => rx.test(p.descripcion)); }
  if (f.stock === "1") items = items.filter((p) => stockTotal(p) > 0);
  const conStockN = items.filter((p) => stockTotal(p) > 0).length;
  if (f.orden && f.orden !== "venta") {
    items = [...items];
    const pr = (p: Product) => p.precio ?? -1;
    if (f.orden === "precio-desc") items.sort((a, b) => pr(b) - pr(a) || score(a) - score(b));
    else if (f.orden === "precio-asc") items.sort((a, b) => (pr(a) < 0 ? 1 : 0) - (pr(b) < 0 ? 1 : 0) || pr(a) - pr(b) || score(a) - score(b));
    else if (f.orden === "stock") items.sort((a, b) => stockTotal(b) - stockTotal(a) || score(a) - score(b));
    else if (f.orden === "nombre") items.sort((a, b) => a.descripcion.localeCompare(b.descripcion, "es"));
    else if (f.orden === "codigo") items.sort((a, b) => a.codigo.localeCompare(b.codigo, "es", { numeric: true }));
  }
  return { items, total: base.length, cats, porMotor: mf ? base.filter((p) => p.om.includes(mf)).length : 0, conStock: conStockN };
}
