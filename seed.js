// ============================================================
// CATÁLOGO SEMILLA — Don Ramón · El Rey de los Cueritos Rellenos
// Catering cubano en Miami (9351 SW 56 St, Miami FL 33165).
// Menú extraído del flyer oficial de @elreydeloscueritosrellenos.
// Combos para 10 personas. Precios en US$ confirmados en el flyer.
// Cueritos enteros y bandejas: precios SUGERIDOS — confirmar con Don Ramón.
// Fotos: reales del dueño + cortesía de Portal (cross-sections).
// Si llegan fotos originales más limpias, se reemplazan los
// archivos en public/images/ con el mismo nombre.
// CATALOG_VERSION: subir para re-sembrar en el servidor.
// ============================================================

const CATALOG_VERSION = 2;

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
            { id: "combo-1", name: "Combo 1 · Cuerito Relleno de Arroz Moro", price: 160.00, unit: "10 personas", active: true, tag: "⭐ El rey de la casa", image: "cuerito-entero.jpg",
              desc: "Cuerito relleno de arroz moro, bandejita de arroz moro, yuca con mojo." },
            { id: "combo-2", name: "Combo 2 · Paleta de Puerco", price: 100.00, unit: "10 personas", active: true, image: "tray-real-1.jpg",
              desc: "Paleta de puerco, arroz moro, yuca con mojo." },
            { id: "combo-3", name: "Combo 3 · Piezas de Pollo", price: 100.00, unit: "10 personas", active: true, image: "bandeja-2.jpg",
              desc: "Muslo y contramuslo, arroz moro, plátano maduro." },
            { id: "combo-4", name: "Combo 4 · Cuerito de Jamón y Queso", price: 180.00, unit: "10 personas", active: true, tag: "NUEVO", image: "tray-real-2.jpg",
              desc: "Cuerito relleno de jamón y queso, arroz moro, yuca con mojo." },
            { id: "combo-5", name: "Combo 5 · Cuerito de Arroz Amarillo", price: 180.00, unit: "10 personas", active: true, tag: "NUEVO", image: "bandeja-1.jpg",
              desc: "Cuerito relleno de arroz amarillo, arroz amarillo, plátano maduro." }
          ]
        }
      ]
    },
    {
      id: "cueritos",
      name: "Cueritos Rellenos",
      icon: "🔥",
      iconImg: "logo.jpg",
      categories: [
        {
          id: "cueritos-enteros",
          name: "Enteros",
          items: [
            { id: "cuerito-congri", name: "Cuerito Relleno de Congrí", price: 100.00, unit: "entero", active: true, tag: "⭐ El rey de la casa", image: "cross-gris.jpg",
              desc: "Cuerito entero relleno de arroz congrí. Cuero crujiente, relleno generoso. Precio sugerido — confirmar con Don Ramón." },
            { id: "cuerito-amarillo", name: "Cuerito Relleno de Arroz Amarillo", price: 100.00, unit: "entero", active: true, tag: "Sugerido", image: "cross-amarillo.jpg",
              desc: "Cuerito entero relleno de arroz amarillo con petit pois. Precio sugerido — confirmar con Don Ramón." },
            { id: "cuerito-jamon-queso", name: "Cuerito Relleno de Jamón y Queso", price: 120.00, unit: "entero", active: true, tag: "NUEVO", image: "cross-cordonbleu.jpg",
              desc: "Cuerito entero relleno de jamón y queso estilo cordon bleu. Precio sugerido — confirmar con Don Ramón." }
          ]
        }
      ]
    },
    {
      id: "bandejas",
      name: "Bandejas",
      icon: "🍽️",
      categories: [
        {
          id: "bandejas-caseras",
          name: "Para acompañar",
          items: [
            { id: "bandeja-yuca", name: "Bandeja de Yuca con Mojo", price: 35.00, unit: "bandeja", active: true, tag: "Sugerido", image: "bandeja-yuca-mojo.jpg",
              desc: "Yuca hervida con mojo criollo y cebollita blanca. Precio sugerido — confirmar con Don Ramón." },
            { id: "bandeja-congri", name: "Bandeja de Congrí", price: 30.00, unit: "bandeja", active: true, tag: "Sugerido", image: "bandeja-congri.jpg",
              desc: "Arroz congrí casero, como en casa. Precio sugerido — confirmar con Don Ramón." }
          ]
        }
      ]
    }
  ]
};

module.exports = { SEED_CATALOG, CATALOG_VERSION };
