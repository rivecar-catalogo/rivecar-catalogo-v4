import products from "@/data/products.json";
import categorias from "@/data/categorias.json";
import modelos from "@/data/modelos.json";
import validaciones from "@/data/validaciones.json";

export type Product = {
  id: number; codigo: string; descripcion: string; modelo: string;
  cat1: string; cat1Slug: string; cat2: string; cat2Slug: string; marca: string;
  refs: string[]; refMB: string[]; refAlt: string[]; om: string[]; img: string | null; imgLocal: boolean; precio: number | null; disp: string[]; stk: Record<string, number>; gallery?: string[];
  modelos: string[]; sivo: string; aplicacionOld: string;
  anio?: string; revisar?: string; imgHist?: string;
  /** Importancia por ventas de los últimos 12 meses (A = 80 % de la venta, B = siguiente 15 %, C = resto). Sin cantidades. */
  pop?: string;
  /** Ritmo de venta: unidades por mes (últimos 12 meses) y semanas que alcanza el stock actual a ese ritmo. */
  vm?: number; sem?: number | null;
  /** Con esto también llevan: [código, % de las facturas de este producto que incluyen al otro]. Calculado de las facturas 2025–2026. */
  co?: [string, number][];
};
export type Sub = { slug: string; nombre: string; n: number };
export type Categoria = { slug: string; nombre: string; n: number; sub: Sub[] };
export type Modelo = { slug: string; nombre: string; n: number };

export const PRODUCTS = products as Product[];
export const CATEGORIAS = categorias as Categoria[];
export const MODELOS = modelos as Modelo[];
export const SHOW_PRICES = process.env.NEXT_PUBLIC_SHOW_PRICES !== "0";
export const TIENDA = process.env.NEXT_PUBLIC_TIENDA_URL || "https://rivecar.sivo.cl";

const byCodigo = new Map(PRODUCTS.map((p) => [p.codigo, p]));
export function getProduct(codigo: string) { return byCodigo.get(decodeURIComponent(codigo)); }
/** Validación de Rivecar por producto: quién, con qué fuente y cuándo. Se completa con la planilla de Gonzalo y el piloto. */
export type Validacion = { por: string; fuente: string; fecha: string };
const VALIDACIONES = validaciones as Record<string, Validacion>;
export function validacion(codigo: string): Validacion | undefined { return VALIDACIONES[codigo]; }
export const TOTAL_VALIDADOS = Object.keys(VALIDACIONES).length;
export function getCategoria(slug: string) { return CATEGORIAS.find((c) => c.slug === slug); }
export function getSub(cat: string, sub: string) { return getCategoria(cat)?.sub.find((s) => s.slug === sub); }
export function getModelo(slug: string) { return MODELOS.find((m) => m.slug === slug); }
const POP_RANK: Record<string, number> = { A: 1, B: 2, C: 3 };
export const popRank = (p: Product) => POP_RANK[p.pop || ""] ?? 9;
/** Orden de los listados: primero lo que más se vende; dentro de cada grupo, el orden original. */
const byPop = (a: Product, b: Product) => popRank(a) - popRank(b);
export function productsByCat(slug: string, sub?: string) {
  return PRODUCTS.filter((p) => p.cat1Slug === slug && (!sub || p.cat2Slug === sub)).sort(byPop);
}
export function productsByModelo(slug: string) { return PRODUCTS.filter((p) => p.modelos.includes(slug)).sort(byPop); }
export function related(p: Product, limit = 8): Product[] {
  const same = PRODUCTS.filter((q) => q.codigo !== p.codigo && q.cat2Slug === p.cat2Slug && q.cat1Slug === p.cat1Slug);
  const shared = same.filter((q) => q.modelos.some((m) => p.modelos.includes(m)));
  const pool = shared.length >= limit ? shared : [...shared, ...same.filter((q) => !shared.includes(q))];
  return pool.slice(0, limit);
}
/** Productos que suelen ir en la misma factura, con el % de facturas en que acompañan a p. */
export function companions(p: Product): { q: Product; pct: number }[] {
  return (p.co || []).map(([c, pct]) => ({ q: byCodigo.get(c), pct })).filter((x): x is { q: Product; pct: number } => !!x.q);
}
/** Sucursales con stock del producto, de mayor a menor, para sugerir un traspaso. */
export function conStock(p: Product): [string, number][] {
  return Object.entries(p.stk || {}).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
}
export function clp(n: number | null) {
  return n == null ? "" : "$" + n.toLocaleString("es-CL");
}
export const STATS = {
  fichas: PRODUCTS.length,
  oem: PRODUCTS.filter((p) => p.refs.length).length,
  fotos: PRODUCTS.filter((p) => p.img).length,
  modelos: MODELOS.length,
  categorias: CATEGORIAS.length,
};
export const INVENTARIO_FECHA = "23-10-2026";
export const VENTAS_FECHA = "27-10-2026";
export const VERSION = "v4.3.1 · 11-11-2026";
export const SHOW_STOCK = process.env.NEXT_PUBLIC_SHOW_STOCK !== "0";
export const stockTotal = (p: Product) => Object.values(p.stk || {}).reduce((a, b) => a + b, 0);
/** Órdenes disponibles en todas las listas (por vehículo, categorías, modelos, buscador). */
export const ORDENES: [string, string][] = [["venta", "Más vendidos primero"], ["precio-desc", "Mayor precio"], ["precio-asc", "Menor precio"], ["stock", "Más disponibles"], ["nombre", "Nombre A–Z"], ["codigo", "Código Rivecar"]];
export const ordenLabel = (k?: string) => ORDENES.find((o) => o[0] === k)?.[1] || ORDENES[0][1];
/** Reordena una lista ya ordenada por venta. "venta" o vacío la deja como viene; los sin precio van al final en los órdenes por precio. */
export function ordenar(items: Product[], orden?: string): Product[] {
  if (!orden || orden === "venta") return items;
  const out = items.map((p, i) => ({ p, i }));
  const pr = (p: Product) => p.precio ?? -1;
  const cmp: Record<string, (a: Product, b: Product) => number> = {
    "precio-desc": (a, b) => pr(b) - pr(a),
    "precio-asc": (a, b) => (pr(a) < 0 ? 1 : 0) - (pr(b) < 0 ? 1 : 0) || pr(a) - pr(b),
    stock: (a, b) => stockTotal(b) - stockTotal(a),
    nombre: (a, b) => a.descripcion.localeCompare(b.descripcion, "es"),
    codigo: (a, b) => a.codigo.localeCompare(b.codigo, "es", { numeric: true }),
  };
  const c = cmp[orden]; if (!c) return items;
  out.sort((x, y) => c(x.p, y.p) || x.i - y.i);
  return out.map((x) => x.p);
}
export const SUCURSALES = [
  { nombre: "Maipú · Casa Matriz", direccion: "Primo de Rivera #733 C, Américo Vespucio", ciudad: "Maipú, Santiago", telefono: "(56-2) 2323 2139" },
  { nombre: "Talagante", direccion: "21 de Mayo #1430", ciudad: "Talagante, Santiago", telefono: "(56-2) 2838 2193 / 2815 5641" },
  { nombre: "Talca", direccion: "Avenida 2 Sur #1610", ciudad: "Talca, Región del Maule", telefono: "(56-71) 259 3406" },
  { nombre: "Coquimbo", direccion: "Avenida Miraflores #685", ciudad: "Coquimbo", telefono: "(56-2) 2312 5793" },
  { nombre: "Concepción", direccion: "Camino a Penco, calle 1 lote 10, Fundo Landa", ciudad: "Concepción", telefono: "+56 9 5013 2901 / +56 9 4919 6910" },
];
export const HORARIO = "Lunes a viernes 9:00 a 17:45 · Sábado 9:45 a 13:00";
