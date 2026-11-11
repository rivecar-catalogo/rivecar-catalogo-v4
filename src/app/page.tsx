import Link from "next/link";
import { Suspense } from "react";
import SearchBox from "@/components/SearchBox";
import ProductCard from "@/components/ProductCard";
import { CATEGORIAS, MODELOS, PRODUCTS, STATS, TIENDA } from "@/lib/catalog";

export default function Home() {
  const destacados = PRODUCTS.filter((p) => p.imgLocal && p.refs.length && p.modelo && p.precio).slice(0, 8);
  const familiasTop = CATEGORIAS;
  const modelosTop = MODELOS.slice(0, 12);
  return (
    <>
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 grid gap-10 md:grid-cols-[1.2fr_1fr] items-center">
          <div>
            <div className="eyebrow text-white/60 mb-3">La nueva sucursal online de Rivecar</div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Encuentra el repuesto correcto por su <span className="text-red-300">número de parte</span>.
            </h1>
            <p className="mt-4 text-white/80 text-lg max-w-xl">
              {STATS.fichas.toLocaleString("es-CL")} productos del sistema de Rivecar, {STATS.oem.toLocaleString("es-CL")} con número de parte o referencia Mercedes-Benz, y {STATS.modelos} modelos para navegar. Encuentra aquí, compra en la tienda.
            </p>
            <div className="mt-6">
              <Suspense fallback={null}>
                <SearchBox big />
              </Suspense>
            </div>
            <p className="mt-3 text-sm"><Link href="/vehiculo" className="inline-flex items-center gap-2 font-semibold text-white bg-white/10 border border-white/30 rounded-md px-3 py-2 hover:bg-white hover:text-navy">¿No sabe el número de parte? Buscar por vehículo con el chasis ›</Link></p>
            <div className="mt-4 flex flex-wrap gap-2">
              {modelosTop.slice(0, 8).map((m) => (
                <Link key={m.slug} href={`/modelo/${m.slug}`} className="chip !bg-transparent !border-white/40 !text-white hover:!bg-white hover:!text-navy">{m.nombre}</Link>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fachada.jpg" alt="Sucursal Rivecar" className="rounded-xl shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [STATS.fichas, "productos publicados"],
          [STATS.oem, "con número de parte o referencia MB"],
          [STATS.fotos, "con fotografía"],
          [STATS.modelos, "modelos con página propia"],
        ].map(([n, l]) => (
          <div key={l} className="card p-5">
            <div className="text-3xl font-extrabold text-navy mono">{Number(n).toLocaleString("es-CL")}</div>
            <div className="text-sm text-muted mt-1">{l}</div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="card p-5 md:p-6 border-l-4 !border-l-red grid gap-3 md:grid-cols-[auto_1fr] md:items-start">
          <div className="eyebrow text-red md:pt-1 md:w-44">Qué es esta versión</div>
          <div className="text-sm text-ink grid gap-1.5">
            <p><strong className="text-navy">Lo que ya hace:</strong> busca entre los 13.102 productos del sistema de Rivecar por número de parte, referencia, código, nombre o modelo, con tolerancia a puntos y guiones; muestra modelo, marca, precio y en qué sucursales hay stock (base del 23-10-2026); ordena primero lo que más se vende y marca los «más pedidos» según las ventas de los últimos 12 meses; lleva a la ficha de la tienda Rivecar para comprar, o arma una cotización por WhatsApp.</p>
            <p><strong className="text-navy">Lo que todavía no hace:</strong> vender aquí mismo ni actualizar el stock en línea. La compra ocurre en la tienda Rivecar; esta capa existe para que el cliente encuentre la pieza correcta antes de llegar a ella.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl font-extrabold text-navy">Por categoría</h2>
          <Link href="/categorias" className="text-sm font-semibold text-red">Ver subcategorías ›</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {familiasTop.map((f) => (
            <Link key={f.slug} href={`/categoria/${f.slug}`} className="card p-4 hover:shadow-md flex items-center justify-between">
              <span className="font-semibold text-navy">{f.nombre}</span>
              <span className="text-xs text-muted mono">{f.n}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl font-extrabold text-navy">Por modelo</h2>
          <Link href="/modelos" className="text-sm font-semibold text-red">Todos los modelos ›</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {MODELOS.map((m) => (
            <Link key={m.slug} href={`/modelo/${m.slug}`} className="chip">{m.nombre} <span className="text-muted">· {m.n}</span></Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="text-2xl font-extrabold text-navy mb-4">Productos destacados</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destacados.map((p) => <ProductCard key={p.codigo} p={p} />)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="card bg-tint p-6 md:p-8 grid gap-6 md:grid-cols-3">
          {[
            ["Encontrar", "Busca por número de parte, OEM, código Rivecar, nombre o modelo. Si no está, dínoslo: cada búsqueda sin resultado se revisa."],
            ["Validar", "Cada ficha muestra aplicaciones de vehículo y referencias cruzadas para confirmar compatibilidad antes de comprar."],
            ["Cotizar y retirar", "Arma tu lista y envíala por WhatsApp. Te confirmamos precio y disponibilidad en la sucursal más cercana o con despacho."],
          ].map(([t, d]) => (
            <div key={t}>
              <div className="eyebrow text-red mb-1">{t}</div>
              <p className="text-sm text-ink">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
