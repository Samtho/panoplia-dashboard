// Diagrama del modelo en estrella: tabla de hechos central + dimensiones conectadas.
type Tabla = { nombre: string; campos: string[]; rel?: string };

const FACT: Tabla = {
  nombre: "dataset_v3",
  campos: ["id_libro · id_subgenero · ean", "codigo_cliente · iso_pais", "serie_numero · fecha", "uds_servidas · importe_neto", "precio_costo · porc_dto · pvp"],
};
// 5 dimensiones, colocadas alrededor (orden: el de las celdas de la rejilla 3×3).
const DIMS: (Tabla & { pos: string; line: [number, number] })[] = [
  { nombre: "DimClientes", campos: ["codigo_cliente (PK)", "iso_pais · localidad", "forma_pago · regimen_iva"], rel: "por codigo_cliente", pos: "col-start-1 row-start-1", line: [17, 22] },
  { nombre: "DimFecha", campos: ["fecha (PK)", "año · mes · trimestre", "día_semana"], rel: "por fecha", pos: "col-start-3 row-start-1", line: [83, 22] },
  { nombre: "DimLibros", campos: ["id_libro (PK) · ean", "id_genero · id_subgenero"], rel: "por id_libro", pos: "col-start-1 row-start-2", line: [17, 50] },
  { nombre: "catalogo_genero / subgenero", campos: ["id_genero → genero", "id_subgenero → subgenero"], rel: "por id_(sub)genero", pos: "col-start-3 row-start-2", line: [83, 50] },
  { nombre: "DimEditoriales · Proveedores · Nombres", campos: ["id_editorial · id_proveedor", "ean → título del libro"], rel: "por id_editorial / ean", pos: "col-start-2 row-start-3", line: [50, 80] },
];

function Card({ t, fact, rel }: { t: Tabla; fact?: boolean; rel?: string }) {
  return (
    <div className={`rounded-xl border shadow-lg ${fact ? "border-terracota bg-[#10302c]" : "border-white/15 bg-[#18211f]"}`}>
      <div className={`px-3 py-2 border-b flex items-center gap-2 ${fact ? "border-terracota/40" : "border-white/10"}`}>
        <span className={`h-2 w-2 rounded-sm ${fact ? "bg-terracota" : "bg-white/40"}`} />
        <span className={`text-sm font-semibold ${fact ? "text-terracota" : "text-white"}`}>{t.nombre}</span>
        {fact && <span className="ml-auto text-[10px] uppercase tracking-wide text-terracota/80">tabla de hechos</span>}
      </div>
      <ul className="px-3 py-2 text-[11px] leading-relaxed text-white/65 space-y-0.5 font-mono">
        {t.campos.map((c) => <li key={c}>{c}</li>)}
      </ul>
      {rel && <div className="px-3 pb-2 text-[10px] text-terracota/80">↳ une con dataset_v3 {rel}</div>}
    </div>
  );
}

export default function DataModelDiagram() {
  return (
    <>
      {/* Desktop: estrella con líneas */}
      <div className="hidden lg:block relative" style={{ minHeight: 560 }}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {DIMS.map((d) => (
            <line key={d.nombre} x1="50" y1="50" x2={d.line[0]} y2={d.line[1]}
              stroke="#2bc4b6" strokeWidth="0.25" strokeDasharray="1.2 1" opacity="0.5" />
          ))}
        </svg>
        <div className="relative grid grid-cols-3 grid-rows-3 gap-x-8 gap-y-6 h-full" style={{ minHeight: 560 }}>
          {DIMS.map((d) => (
            <div key={d.nombre} className={`${d.pos} self-center z-10`}><Card t={d} rel={d.rel} /></div>
          ))}
          <div className="col-start-2 row-start-2 self-center z-10"><Card t={FACT} fact /></div>
        </div>
      </div>

      {/* Móvil: apilado, hechos primero */}
      <div className="lg:hidden space-y-3">
        <Card t={FACT} fact />
        {DIMS.map((d) => <Card key={d.nombre} t={d} rel={d.rel} />)}
      </div>
    </>
  );
}
