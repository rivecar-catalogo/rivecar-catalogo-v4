import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="eyebrow text-red">404</div>
      <h1 className="text-3xl font-extrabold text-navy mt-1">No encontramos esa página</h1>
      <p className="text-muted mt-2">Prueba buscando el código del repuesto.</p>
      <Link href="/" className="btn-navy mt-6">Volver al inicio</Link>
    </div>
  );
}
