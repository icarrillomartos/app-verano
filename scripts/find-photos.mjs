// Busca una foto real (Wikimedia Commons) para cada plan y emite JSON {title, image_url}.
// Uso: node scripts/find-photos.mjs > data/fotos.json
const PLANS = [
  ["Baño en el Pantano de San Juan", "Embalse de San Juan Madrid"],
  ["Paddle surf y kayak en San Juan", "Embalse de San Juan Madrid agua"],
  ["Las Presillas de Rascafría", "Las Presillas Rascafría"],
  ["Ruta a la Charca Verde en La Pedriza", "La Pedriza Manzanares el Real"],
  ["Camino Schmid en Cercedilla", "Cercedilla Sierra de Guadarrama"],
  ["Playa urbana de Madrid Río", "Madrid Río parque"],
  ["Atardecer en el Templo de Debod", "Templo de Debod Madrid"],
  ["El Rastro de Madrid", "El Rastro Madrid"],
  ["Azotea del Círculo de Bellas Artes", "Círculo de Bellas Artes Madrid edificio"],
  ["Piscina del Lago de Casa de Campo", "Casa de Campo Madrid lago"],
  ["Mercado de Motores", "Museo del Ferrocarril Madrid Delicias"],
  ["Cine de verano gratis en Las Vistillas", "Las Vistillas Madrid"],
  ["Veranos de la Villa: concierto inaugural", "Cuartel Conde Duque Madrid patio"],
  ["Veranos de la Villa: cultura al aire libre", "Conde Duque Madrid"],
  ["Noches del Botánico", "Real Jardín Botánico Madrid"],
  ["Mad Cool Festival 2026", "Mad Cool Festival"],
  ["Festival Tomavistas", "Parque Enrique Tierno Galván Madrid"],
  ["Cine de verano en Matadero", "Matadero Madrid"],
  ["Fiestas de La Paloma en La Latina", "La Latina Madrid calle"],
  ["Escapada a Oporto en avión", "Porto Ribeira Portugal"],
  ["Escapada a Lisboa low cost", "Lisboa Alfama"],
  ["Chollo de vuelo a Marrakech", "Marrakech Jemaa el Fna"],
  ["Finde de playa en Mallorca", "Palma de Mallorca catedral"],
  ["Escapada en tren a Segovia", "Acueducto de Segovia"],
];

const headers = {
  "User-Agent":
    "LaCuadrillaApp/1.0 (https://app-verano.vercel.app; admin@example.com)",
};

async function findImage(q) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*" +
    "&generator=search&gsrnamespace=6&gsrlimit=12" +
    "&gsrsearch=" + encodeURIComponent(q) +
    "&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1280";
  const r = await fetch(url, { headers });
  const j = await r.json();
  const pages = j?.query?.pages ? Object.values(j.query.pages) : [];
  pages.sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
  const cands = pages
    .map((p) => p.imageinfo && p.imageinfo[0])
    .filter(Boolean)
    .filter((i) => /image\/(jpeg|png)/.test(i.mime || ""));
  // Preferencia: apaisada y razonablemente grande
  const landscape = cands.find(
    (i) => (i.width || 0) >= (i.height || 0) && (i.thumbwidth || i.width || 0) >= 800
  );
  const pick = landscape || cands[0];
  return pick ? pick.thumburl : null;
}

const out = [];
for (const [title, q] of PLANS) {
  try {
    const image_url = await findImage(q);
    out.push({ title, image_url });
    console.error((image_url ? "OK  " : "NULL") + "  " + title);
  } catch (e) {
    out.push({ title, image_url: null });
    console.error("ERR  " + title + " :: " + e.message);
  }
}
console.log(JSON.stringify(out, null, 2));
