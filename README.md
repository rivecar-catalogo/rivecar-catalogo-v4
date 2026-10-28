# Rivecar · Catálogo online · prototipo v4 (28-10-2026)

**Qué cambia respecto de la v3**

- **Sucursales corregidas.** La v3 mostraba invertidos Maipú y Talagante. En la base de Rivecar la columna `STOCK` es **Talagante** y `STOCREMO` es **Maipú** (verificado producto por producto contra el inventario de Rivecar). La v4 usa la asignación correcta: STOCK→Talagante, STOCREMO→Maipú, STALCA→Talca, SCOQUIM→Coquimbo, SCONCE→Concepción.
- **Primero lo que más se vende.** Con las ventas reales (12 meses al 27-10-2026) cada producto tiene una clase A, B o C (A = los 844 que hacen el 80 % de la venta). Los listados por categoría y modelo, y los resultados por texto del buscador, muestran primero los A. Las tarjetas de los A llevan la etiqueta «Más pedido». No se publican cantidades vendidas.
- **Datos:** `src/data/products.json` (campo `pop`) y `public/data/index.json` (campo `v`: 1 = A, 2 = B, 3 = C, 9 = sin venta). Se regeneran con `python3 scripts/actualizar_v4.py .` a partir de `scripts/popularidad_ventas_12m.json`.

## Base (v2–v3)

Capa de búsqueda del catálogo Rivecar: 13.102 productos exportados del sistema SIVO el 14-10-2026,
con búsqueda tolerante por número de parte, referencia, código, nombre o modelo; diez categorías con
subcategorías; 23 páginas por modelo; precios publicados (IVA incl.); botón «Comprar en la tienda Rivecar»
que lleva a la ficha de rivecar.sivo.cl con parámetros UTM; lista de cotización por WhatsApp.
Sin stock: la disponibilidad se confirma en la tienda.

## Correrlo en tu computador

Requisitos: Node.js LTS y Git instalados (ya los tienes).

```
npm install
npm run dev
```

Abre http://localhost:3000 en el navegador. Para detenerlo: Ctrl + C en la ventana de PowerShell.

## Configuración (archivo `.env.local`)

| Variable | Qué hace |
|---|---|
| `NEXT_PUBLIC_WHATSAPP` | Número que recibe las cotizaciones, con código de país y sin signos (ej. `56912345678`). Vacío = el botón abre WhatsApp sin destinatario. |
| `NEXT_PUBLIC_SHOW_PRICES` | `1` muestra precios (los publicados en la tienda Rivecar, IVA incl.); `0` los oculta. |
| `NEXT_PUBLIC_TIENDA_URL` | Tienda a la que enlaza el botón de compra. Hoy `https://rivecar.sivo.cl`. |
| `NEXT_PUBLIC_POSTHOG_KEY` | Clave de proyecto de PostHog para registrar búsquedas, búsquedas sin resultado y cotizaciones. Vacío = no se registra nada. |

Tras cambiar `.env.local` hay que reiniciar `npm run dev`.

## Dónde está cada cosa

| Carpeta / archivo | Contenido |
|---|---|
| `src/data/products.json` | Los 13.102 productos (SKU, nombre, modelo, categoría N1/N2, marca, referencias, imagen, precio, modelos, enlace a la tienda). |
| `src/data/categorias.json`, `src/data/modelos.json` | Diez categorías con subcategorías y 23 modelos con sus conteos. |
| `public/img/` | 4.581 fotografías locales (catálogo histórico); las demás se cargan desde Google Drive o SIVO por enlace. |
| `public/data/index.json` | Índice compacto que descarga el navegador para buscar sin servidor. |
| `src/lib/catalog.ts` | Acceso a los datos, sucursales y horario. |
| `src/app/` | Las páginas: inicio, `buscar`, `producto/[codigo]`, `familia/[slug]`, `modelo/[slug]`, `cotizar`, `sucursales`. |
| `src/components/` | Cabecera, pie, buscador, tarjeta de producto, botón de cotización. |

## Actualizar el catálogo

Los datos salen del export «productos_exportados» de SIVO (consolidado en
`Rivecar_Maestro_Export_14OCT2026_consolidado.xlsx`). Para cargar una versión nueva se regeneran
`src/data/*.json` y `public/data/index.json` con el script de carga (pedir a Soportek). Nunca se incluye el costo.

## Imágenes de Google Drive

Los 2.394 enlaces de Drive se muestran como miniatura (`drive.google.com/thumbnail?id=…`). Solo cargan si
los archivos están compartidos como «cualquiera con el enlace». Si no cargan, descargar las carpetas de
Drive a `public/img/` con el nombre del SKU y regenerar los datos.

## Publicar en Vercel

1. Subir el proyecto a GitHub (ver guía paso a paso).
2. En vercel.com › *Add New › Project* › importar el repositorio `rivecar-catalogo-v4`.
3. En *Environment Variables* agregar `NEXT_PUBLIC_WHATSAPP` (y PostHog si se usa).
4. *Deploy*. Vercel entrega una dirección `https://rivecar-catalogo-v4.vercel.app`; después se conecta `catalogo.rivecar.cl`.

## Qué falta para que sea la tienda real

Precio y disponibilidad por sucursal (integración con el sistema comercial), cuentas B2B/B2C,
carrito con pago (Transbank), facturación electrónica, panel de administración del catálogo.
Todo eso está dimensionado en la propuesta de Soportek × Connectek.


## v3 (24-10-2026): disponibilidad por sucursal

Cada ficha muestra en qué sucursales hay stock (Maipú, Talagante, Talca, Coquimbo, Concepción), sin cantidades ni costos, según la base PRODUCTO al 23-10-2026. (En la v3 la asignación STOCK→Maipú y STOCREMO→Talagante estaba invertida; corregida en la v4.) Para actualizarla, regenerar `src/data/products.json` con el campo `disp`.

La cantidad por sucursal se muestra por defecto (demo). Para ocultar las cifras y dejar solo disponible/no disponible: `NEXT_PUBLIC_SHOW_STOCK=0` en `.env.local` (y en las variables del proyecto en Vercel).
