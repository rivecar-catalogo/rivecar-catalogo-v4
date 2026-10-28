"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MiniSearch from "minisearch";
import { track } from "@/lib/analytics";
import Img from "@/components/Img";

type Row = { c: string; d: string; m: string; b: string; f: string; r: string; i: string; p: number; s: number; k: number; o: string; v?: number };
const SHOW_STOCK = process.env.NEXT_PUBLIC_SHOW_STOCK !== "0";
const SHOW_PRICES = process.env.NEXT_PUBLIC_SHOW_PRICES !== "0";
const clp = (n: number) => "$" + n.toLocaleString("es-CL");

const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
/** Para códigos: quita puntos, guiones y espacios. "006.888.08.03" → "0068880803" */
const code = (s: string) => norm(s).replace(/[^a-z0-9]/g, "");
/** Lo que escribe el cliente: además quita el prefijo «A» de las referencias Mercedes-Benz
 *  ("A 651 200 06 70" → "6512000670"), porque la base de Rivecar las guarda sin él. */
const refCode = (s: string) => code(s).replace(/^a(?=\d{9,}$)/, "");

let cache: { rows: Row[]; ms: MiniSearch<Row & { id: number; codes: string }> } | null = null;

async function load() {
  if (cache) return cache;
  const rows: Row[] = await fetch("/data/index.json").then((r) => r.json());
  const ms = new MiniSearch<Row & { id: number; codes: string }>({
    fields: ["d", "m", "b", "f", "codes"],
    storeFields: ["c"],
    processTerm: (t) => norm(t),
    // Tolerancia a errores de tipeo SOLO en palabras (≥4 letras, sin dígitos).
    // En códigos y números de parte un dígito distinto es otra pieza: nunca se aproxima.
    searchOptions: {
      prefix: true,
      fuzzy: (t: string) => (/\d/.test(t) || t.length < 4 ? false : 0.15),
      combineWith: "AND",
      boost: { codes: 4, d: 2 },
    },
  });
  ms.addAll(rows.map((r, id) => ({ ...r, id, codes: [r.c, r.r].filter(Boolean).join(" ") })));
  cache = { rows, ms };
  return cache;
}

export default function SearchClient() {
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const [data, setData] = useState<typeof cache>(null);
  const [fam, setFam] = useState<string>("");
  const [shown, setShown] = useState(48);
  const tracked = useRef("");

  useEffect(() => {
    load().then(setData);
  }, []);
  useEffect(() => {
    setShown(48);
    setFam("");
  }, [q]);

  const results = useMemo(() => {
    if (!data || !q.trim()) return [] as Row[];
    const { rows, ms } = data;
    const cq = refCode(q);
    const allCodes = (r: Row) => [r.c, ...(r.r ? r.r.split(" ") : [])];
    // números de fabricante escritos en el nombre ("4.40207", "60531933", "SEB015940069")
    const descCodes = (r: Row) => r.d.split(/\s+/).filter((t) => /\d/.test(t)).map(code).filter((x) => x.length >= 4);
    const isCode = cq.length >= 3 && /\d/.test(cq);
    const exactOnly = cq.length >= 3 && !isCode; // p. ej. referencias escritas con letras
    const take = (pred: (r: Row) => boolean, seen: Set<string>) => {
      const out = rows.filter((r) => !seen.has(r.c) && pred(r));
      out.forEach((r) => seen.add(r.c));
      return out;
    };
    const seen = new Set<string>();
    // motor: "OM 651", "om651", "OM-457" → primero los repuestos con ese motor registrado
    const omq = q.trim().match(/^om[\s.-]*(\d{3})$/i);
    const byOM = omq ? take((r) => (r.o || "").split(",").includes(`OM ${omq[1]}`), seen) : [];
    if (omq) return byOM; // búsqueda por motor: solo repuestos con ese motor registrado
    const byCode = isCode
      ? [
          // 1) exacto en código Rivecar, referencia OEM o número del fabricante
          ...take((r) => allCodes(r).some((x) => code(x) === cq) || descCodes(r).includes(cq), seen),
          // 2) referencias que empiezan con lo buscado
          ...take((r) => allCodes(r).some((x) => code(x).startsWith(cq)), seen),
          // 3) número del fabricante que empieza con lo buscado
          ...take((r) => descCodes(r).some((x) => x.startsWith(cq)), seen),
          // 4) referencias que contienen lo buscado (útil con códigos cortos o incompletos)
          ...take((r) => allCodes(r).some((x) => code(x).includes(cq)), seen),
        ]
      : exactOnly
        ? take((r) => allCodes(r).some((x) => code(x) === cq), seen)
        : [];
    // 5) búsqueda por texto (nombre, modelo, marca, familia). Los códigos ya se resolvieron arriba
    //    de forma exacta; aquí no se buscan por trozos para no traer piezas que no corresponden.
    // v4: a igual coincidencia, primero lo que más se vende (A, B, C); el orden es estable dentro de cada grupo
    const byText = ms.search(q, { fields: ["d", "m", "b", "f"] }).map((h) => rows[h.id as number]).filter((r) => r && !seen.has(r.c))
      .map((r, i) => ({ r, i })).sort((a, b) => (a.r.v ?? 9) - (b.r.v ?? 9) || a.i - b.i).map((x) => x.r);
    return [...byOM, ...byCode, ...byText];
  }, [data, q]);

  useEffect(() => {
    if (!data || !q.trim() || tracked.current === q) return;
    tracked.current = q;
    track(results.length ? "busqueda" : "busqueda_sin_resultado", { q, n: results.length });
  }, [data, q, results.length]);

  const fams = useMemo(() => {
    const c = new Map<string, number>();
    results.forEach((r) => c.set(r.f, (c.get(r.f) || 0) + 1));
    return [...c.entries()].sort((a, b) => b[1] - a[1]);
  }, [results]);
  const filtered = fam ? results.filter((r) => r.f === fam) : results;
  const cq = refCode(q);
  const matchedRef = (r: Row): { ref: string; hit: boolean; extra: number } => {
    const refs = r.r ? r.r.split(" ") : [];
    const hit = cq.length >= 3 ? refs.find((x) => code(x).startsWith(cq)) || refs.find((x) => code(x).includes(cq)) : undefined;
    return { ref: hit || refs[0] || "", hit: !!hit, extra: Math.max(0, refs.length - 1) };
  };
  const shortCode = !/^om/i.test(q.trim()) && /^\d+$/.test(cq) && cq.length >= 3 && cq.length <= 5;

  if (!q.trim()) return <p className="text-muted">Escribe un número de parte, código o nombre para buscar.</p>;
  if (!data) return <p className="text-muted">Cargando catálogo…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h1 className="text-2xl font-extrabold text-navy">
          {results.length.toLocaleString("es-CL")} resultado{results.length === 1 ? "" : "s"} para <span className="text-red">“{q}”</span>
        </h1>
      </div>
      {shortCode && results.length > 0 ? (
        <p className="text-sm text-muted -mt-2 mb-4">Con {cq.length} dígitos se muestran las referencias que contienen «{cq}», primero las que empiezan con ese número. Compartir dígitos no hace equivalentes a dos piezas: confirma siempre con la referencia completa.</p>
      ) : null}
      {results.length === 0 ? (
        <div className="card p-6 bg-pink">
          <p className="font-semibold text-navy">No encontramos ese código en el catálogo publicado.</p>
          <p className="text-sm text-ink mt-1">Revisa puntos y guiones (la búsqueda los ignora), o envíanos el código por WhatsApp: muchas piezas se pueden pedir aunque no estén en la ficha pública.</p>
          <a className="btn-red mt-4" href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || ""}?text=${encodeURIComponent(`Hola Rivecar, busco el repuesto: ${q}`)}`} target="_blank" rel="noopener">Consultar por WhatsApp</a>
        </div>
      ) : (
        <>
          {fams.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-5">
              <button className={`chip ${!fam ? "on" : ""}`} onClick={() => setFam("")}>Todas · {results.length}</button>
              {fams.slice(0, 12).map(([f, n]) => (
                <button key={f} className={`chip ${fam === f ? "on" : ""}`} onClick={() => setFam(f)}>{f.toLowerCase()} · {n}</button>
              ))}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.slice(0, shown).map((r) => (
              <Link key={r.c} href={`/producto/${encodeURIComponent(r.c)}`} className="card overflow-hidden hover:shadow-md transition flex flex-col">
                <div className="aspect-[4/3] bg-tint grid place-items-center overflow-hidden">
                  <Img src={r.i || null} alt={r.d} className="w-full h-full object-contain p-2" />
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <div className="text-[11px] text-muted uppercase tracking-wider">{r.f}</div>
                  {r.v === 1 ? <span className="self-start text-[10px] font-bold uppercase tracking-wider text-white bg-red rounded px-1.5 py-0.5">Más pedido</span> : null}
                  <div className="font-semibold text-navy leading-snug">{r.d}</div>
                  {(() => { const mr = matchedRef(r); return (
                    <div className="mono text-sm">{r.c}{mr.ref ? <span className={mr.hit ? "text-red font-semibold" : "text-muted"}> · {mr.ref}</span> : null}{mr.extra > 0 ? <span className="text-xs text-muted"> +{mr.extra} ref.</span> : null}</div>
                  ); })()}
                  {r.m ? <div className="text-xs text-muted line-clamp-2">{r.m}</div> : null}
                  <div className={`text-xs ${r.s ? "text-green-700" : "text-muted"}`}>{r.s ? (SHOW_STOCK ? `${r.k.toLocaleString("es-CL")} en stock · ${r.s} sucursal${r.s === 1 ? "" : "es"}` : `Disponible en ${r.s} sucursal${r.s === 1 ? "" : "es"}`) : "Consultar disponibilidad"}</div>
                  {SHOW_PRICES && r.p ? <div className="pt-1 font-bold text-navy">{clp(r.p)} <span className="text-xs text-muted font-normal">IVA incl.</span></div> : null}
                </div>
              </Link>
            ))}
          </div>
          {filtered.length > shown && (
            <div className="text-center mt-6">
              <button className="btn-ghost" onClick={() => setShown(shown + 48)}>Mostrar más ({filtered.length - shown} restantes)</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
