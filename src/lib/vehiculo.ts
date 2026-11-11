import data from "@/data/vehiculos.json";
import patentes from "@/data/patentes.json";
import { PRODUCTS, MODELOS, popRank, stockTotal, ordenar, type Product } from "@/lib/catalog";

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
  /** Números de modelo que trae el registro ("914", "1836"): sirven para encontrar productos que nombran el modelo aunque la familia no coincida. */
  modeloNum?: string[];
};

/** Motor por número de modelo del registro, solo los inequívocos. El resto se infiere de las series de la familia. */
const MOTOR_POR_MODELO: Record<string, string> = { "914": "OM 904", "915": "OM 904", "916": "OM 924", "710": "OM 904", "711": "OM 904", "712": "OM 904", "1016": "OM 924", "1719": "OM 924" };
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
  const modeloNum = [...new Set((modelo.match(/(?<![A-Z0-9.])[0-9]{3,4}(?![0-9.])/g) || []))];
  // Motor según el número de modelo cuando es inequívoco; si no, los motores de las series conocidas de la familia.
  const porNum = modeloNum.map((n) => MOTOR_POR_MODELO[n]).filter(Boolean) as string[];
  // Sprinter y Vito: el motor depende del año (OM 611/612 hasta 2005, OM 646/651 2006–2009, OM 651 2010–2018, OM 651/654 desde 2019).
  const porAnio = (slug === "sprinter" || slug === "vito") && anio ? (anio <= 2005 ? ["OM 611", "OM 612"] : anio <= 2009 ? ["OM 646", "OM 651"] : anio <= 2018 ? ["OM 651"] : ["OM 651", "OM 654"]) : [];
  const motores = porNum.length ? [...new Set(porNum)] : porAnio.length ? porAnio : slug ? [...new Set(Object.values(SERIES).filter((s) => s.slug === slug).flatMap((s) => s.motores))] : [];
  return {
    entrada: input, familia: `${modelo}${m ? ` · familia ${m.nombre}` : ""} (${tipo.toLowerCase()}${anio ? `, ${anio}` : ""})`, slug, anioModelo: anio || undefined,
    motoresProbables: motores, origen: undefined, modeloNum,
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
export { ORDENES } from "@/lib/catalog";

/** Productos que aplican al vehículo, ordenados: primero los que nombran su motor, después por venta. */
export function productosParaVehiculo(v: Vehiculo, f: Filtro): { items: Product[]; total: number; cats: { cat: string; n: number }[]; porMotor: number; conStock: number; porModelo: number; modeloNum: string[] } {
  let base = v.slug ? PRODUCTS.filter((p) => p.modelos.includes(v.slug)) : [];
  // Productos que nombran el número de modelo del registro ("814/914", "1836/0500RS") aunque su familia sea otra: el mesón los conoce así.
  const nums = (v.modeloNum || []).filter((n) => n.length >= 3);
  const rxNum = nums.length ? new RegExp(`(?<![0-9.])(${nums.join("|")})(?![0-9])`) : null;
  const porModeloSet = new Set<string>();
  if (rxNum) {
    for (const p of PRODUCTS) if (rxNum.test(p.modelo + " " + (p.aplicacionOld || ""))) porModeloSet.add(p.codigo);
    const extra = PRODUCTS.filter((p) => porModeloSet.has(p.codigo) && !base.includes(p));
    base = [...base, ...extra];
  }
  if (v.motorFam) {
    const conMotor = PRODUCTS.filter((p) => p.om.includes(v.motorFam!) && !base.includes(p));
    base = [...base, ...conMotor];
  }
  const mf = v.motorFam;
  const score = (p: Product) => (mf && p.om.includes(mf) ? 0 : porModeloSet.has(p.codigo) ? 1 : 2) * 10 + popRank(p);
  base.sort((a, b) => score(a) - score(b));
  const cats = Object.entries(base.reduce<Record<string, number>>((acc, p) => { acc[p.cat1] = (acc[p.cat1] || 0) + 1; return acc; }, {})).map(([cat, n]) => ({ cat, n })).sort((a, b) => b.n - a.n);
  let items = base;
  if (f.cat) items = items.filter((p) => p.cat1 === f.cat);
  if (f.q) {
    // Filtro por palabras: cada palabra de 3 letras o más debe aparecer, en cualquier orden ("sensor aceite" encuentra "SENSOR NIVEL ACEITE"). Sin acentos; en números se ignoran puntos y guiones.
    const norm = (t: string) => t.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const words = norm(f.q).split(/\s+/).filter((w) => w.length >= 3 || /\d/.test(w));
    items = items.filter((p) => {
      const hay = norm(p.descripcion + " " + p.codigo + " " + p.refs.join(" ") + " " + p.modelo);
      const hayNum = hay.replace(/[^0-9A-Z]/g, "");
      return words.every((w) => hay.includes(w) || (/\d/.test(w) && hayNum.includes(w.replace(/[^0-9A-Z]/g, ""))));
    });
  }
  if (f.eje) { const rx = EJES.find((e) => e[0] === f.eje)?.[2]; if (rx) items = items.filter((p) => rx.test(p.descripcion)); }
  if (f.freno) { const rx = FRENOS.find((e) => e[0] === f.freno)?.[2]; if (rx) items = items.filter((p) => rx.test(p.descripcion)); }
  if (f.stock === "1") items = items.filter((p) => stockTotal(p) > 0);
  const conStockN = items.filter((p) => stockTotal(p) > 0).length;
  items = ordenar(items, f.orden);
  return { items, total: base.length, cats, porMotor: mf ? base.filter((p) => p.om.includes(mf)).length : 0, conStock: conStockN, porModelo: porModeloSet.size, modeloNum: nums };
}
