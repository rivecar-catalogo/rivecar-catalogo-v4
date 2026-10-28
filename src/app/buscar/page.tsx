import { Suspense } from "react";
import SearchClient from "./SearchClient";

export const metadata = { title: "Buscar" };

export default function BuscarPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<p className="text-muted">Cargando buscador…</p>}>
        <SearchClient />
      </Suspense>
    </div>
  );
}
