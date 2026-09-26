// ============================================================
// CATÁLOGO SEMILLA — Don Ramón · El Rey de los Cueritos Rellenos
// Catering cubano en Miami (9351 SW 56 St, Miami FL 33165).
// Menú REAL confirmado por Don Ramón vía WhatsApp (26-sep-2026):
// flyers oficiales con combos, solos, bandejitas y precios finales.
// Precios en US$. Fotos: recortes directos de sus flyers.
// CATALOG_VERSION: subir para re-sembrar en el servidor.
// ============================================================

const CATALOG_VERSION = 6;

const SEED_CATALOG = {
  departments: [
    {
      id: "combos",
      name: "Combos para 10 personas",
      icon: "👑",
      iconImg: "combo-cuerito.jpg",
      categories: [
        {
          id: "combos-10p",
          name: "Para 10 personas",
          items: [
            { id: "combo-1", name: "Combo 1 · Cuerito Relleno de Arroz Moro", price: 160.00, unit: "10 personas", active: true, tag: "⭐ El rey de la casa", image: "combo1-hero.jpg",
              desc: "1 cuerito relleno de arroz moro + 1 bandejita de arroz moro + 1 bandejita de yuca con mojo." },
            { id: "combo-2", name: "Combo 2 · Paleta de Puerco", price: 100.00, unit: "10 personas", active: true, image: "pernil-real.jpg",
              desc: "1 paleta de puerco + 1 bandejita de arroz moro + 1 bandejita de yuca con mojo." },
            { id: "combo-3", name: "Combo 3 · Piezas de Pollo", price: 100.00, unit: "10 personas", active: true, image: "pollo-piezas.jpg",
              desc: "10 piezas de pollo (muslo con contramuslo) + 1 bandejita de arroz moro + 1 bandejita de plátano maduro." },
            { id: "combo-4", name: "Combo 4 · Cuerito de Jamón y Queso", price: 180.00, unit: "10 personas", active: true, tag: "NUEVO", image: "combo4-hero.jpg",
              desc: "1 cuerito de jamón y queso + 1 bandejita de arroz moro + 1 bandejita de yuca con mojo." },
            { id: "combo-5", name: "Combo 5 · Cuerito de Arroz Amarillo", price: 180.00, unit: "10 personas", active: true, tag: "NUEVO", image: "combo5-hero.jpg",
              desc: "1 cuerito de arroz amarillo + 1 bandejita de arroz amarillo + 1 bandejita de plátano maduro." }
          ]
        }
      ]
    },
    {
      id: "cueritos",
      name: "Solos",
      icon: "🔥",
      iconImg: "logo.jpg",
      categories: [
        {
          id: "cueritos-enteros",
          name: "Enteros",
          items: [
            { id: "cuerito-congri", name: "Cuerito Relleno de Arroz Moro", price: 120.00, unit: "solo", active: true, image: "cuerito-moro-close.jpg",
              desc: "Cuerito entero relleno de arroz moro. Cuero crujiente, relleno generoso." },
            { id: "cuerito-amarillo", name: "Cuerito Relleno de Arroz Amarillo", price: 140.00, unit: "solo", active: true, image: "cuerito-amarillo-close.jpg",
              desc: "Cuerito entero relleno de arroz amarillo. Cuero crujiente, relleno generoso." },
            { id: "cuerito-jamon-queso", name: "Cuerito Relleno de Jamón y Queso", price: 140.00, unit: "solo", active: true, image: "cuerito-jamonqueso-close.jpg",
              desc: "Cuerito entero relleno de jamón y queso. Cuero crujiente, relleno generoso." },
            { id: "paleta-sola", name: "Paleta Sola", price: 60.00, unit: "sola", active: true, image: "paleta-sola.jpg",
              desc: "Paleta de puerco asada entera, cuero crujiente." }
          ]
        }
      ]
    },
    {
      id: "bandejas",
      name: "Bandejitas",
      icon: "🍽️",
      categories: [
        {
          id: "bandejas-caseras",
          name: "Para acompañar",
          items: [
            { id: "bandeja-yuca", name: "Bandejita de Yuca con Mojo", price: 20.00, unit: "bandejita", active: true, image: "bandejita-yuca.jpg",
              desc: "Yuca hervida con mojo criollo y cebollita." },
            { id: "bandeja-congri", name: "Bandejita de Arroz Moro", price: 20.00, unit: "bandejita", active: true, image: "bandejita-arroz-moro.jpg",
              desc: "Arroz moro casero, como en casa." },
            { id: "bandeja-amarillo", name: "Bandejita de Arroz Amarillo", price: 20.00, unit: "bandejita", active: true, image: "bandejita-arroz-amarillo.jpg",
              desc: "Arroz amarillo casero con petit pois." },
            { id: "bandeja-maduro", name: "Bandejita de Plátano Maduro", price: 20.00, unit: "bandejita", active: true, image: "bandejita-maduro.jpg",
              desc: "Plátano maduro frito, dulce y dorado." }
          ]
        }
      ]
    }
  ]
};

module.exports = { SEED_CATALOG, CATALOG_VERSION };
