// ============================================================
// CATÁLOGO SEMILLA — Don Ramón · El Rey de los Cueritos Rellenos
// Catering cubano en Miami (9351 SW 56 St, Miami FL 33165).
// Menú extraído del flyer oficial de @elreydeloscueritosrellenos.
// Combos para 10 personas. Precios en US$ confirmados en el flyer.
// Fotos: reales, enviadas por el dueño (carpeta don-ramon-assets).
// Si llegan fotos originales más limpias, se reemplazan los
// archivos en public/images/ con el mismo nombre.
// CATALOG_VERSION: subir para re-sembrar en el servidor.
// ============================================================

const CATALOG_VERSION = 1;

const SEED_CATALOG = {
  departments: [
    {
      id: "combos",
      name: "Combos para 10 Personas",
      icon: "👑",
      iconImg: "combo-cuerito.jpg",
      categories: [
        {
          id: "combos-10p",
          name: "Para 10 personas",
          items: [
            { id: "combo-1", name: "Combo 1 · Cuerito Relleno de Arroz Moro", price: 160.00, unit: "10 personas", active: true, tag: "⭐ El rey de la casa", image: "combo-cuerito.jpg",
              desc: "Cuerito relleno de arroz moro, bandejita de arroz moro, yuca con mojo." },
            { id: "combo-2", name: "Combo 2 · Paleta de Puerco", price: 100.00, unit: "10 personas", active: true, image: "bandeja-1.jpg",
              desc: "Paleta de puerco, arroz moro, yuca con mojo." },
            { id: "combo-3", name: "Combo 3 · Piezas de Pollo", price: 100.00, unit: "10 personas", active: true, image: "bandeja-2.jpg",
              desc: "Muslo y contramuslo, arroz moro, plátano maduro." },
            { id: "combo-4", name: "Combo 4 · Cuerito de Jamón y Queso", price: 180.00, unit: "10 personas", active: true, tag: "NUEVO", image: "combo-cuerito.jpg",
              desc: "Cuerito relleno de jamón y queso, arroz moro, yuca con mojo." },
            { id: "combo-5", name: "Combo 5 · Cuerito de Arroz Amarillo", price: 180.00, unit: "10 personas", active: true, tag: "NUEVO", image: "combo-cuerito.jpg",
              desc: "Cuerito relleno de arroz amarillo, arroz amarillo, plátano maduro." }
          ]
        }
      ]
    }
  ]
};

module.exports = { SEED_CATALOG, CATALOG_VERSION };
