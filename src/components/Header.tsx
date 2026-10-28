import Link from "next/link";
import SearchBox from "./SearchBox";
import QuoteBadge from "./QuoteBadge";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-line">
      <div className="bg-navy text-white text-[11px] tracking-widest uppercase">
        <div className="mx-auto max-w-6xl px-4 h-8 flex items-center justify-between">
          <span>Repuestos Mercedes-Benz · 5 sucursales · despacho a todo Chile</span>
          <span className="hidden sm:inline">Cotiza en línea · retira en sucursal o despacho</span>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link href="/" className="shrink-0 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Rivecar" className="h-9 w-auto" />
        </Link>
        <div className="flex-1 hidden md:block">
          <SearchBox />
        </div>
        <nav className="flex items-center gap-4 text-sm font-semibold text-navy">
          <Link href="/modelos" className="hidden sm:inline hover:text-red">Modelos</Link>
          <Link href="/categorias" className="hidden sm:inline hover:text-red">Categorías</Link>
          <Link href="/sucursales" className="hidden sm:inline hover:text-red">Sucursales</Link>
          <QuoteBadge />
        </nav>
      </div>
      <div className="md:hidden px-4 pb-3">
        <SearchBox />
      </div>
    </header>
  );
}
