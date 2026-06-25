// Busca foto (Wikimedia Commons) de cada plan, la descarga y la sube a Supabase
// Storage (bucket plan-photos). Escribe data/planes-final.json (planes con image_url).
import fs from "node:fs";

const REF = "ekrigvydtruusckoqtrf";
const KEY = "sb_publishable_6Hsumbsje-FETy-XbuVlUQ_4IqNUHv1";
const BUCKET = "plan-photos";
const UA = "LaCuadrillaApp/1.0 (icarrillomartos@gmail.com)";

const QUERIES = {
  "Playa urbana de Madrid Río": "Madrid Río parque",
  "Día de playa en el embalse de San Juan": "Embalse de San Juan Madrid",
  "Baño en Las Presillas de Rascafría": "Las Presillas Rascafría",
  "Playa fluvial del Alberche": "Aldea del Fresno",
  "Kayak y paddle surf en el Pantano de San Juan": "Embalse de San Juan Madrid",
  "Camino Schmid de Navacerrada a Cercedilla": "Cercedilla Sierra de Guadarrama",
  "Cascada del Purgatorio y Bosque Finlandés": "Cascada del Purgatorio Rascafría",
  "Tarde de piscina municipal": "piscina al aire libre",
  "Domingo de rastreo en El Rastro": "El Rastro Madrid",
  "Mercado de Motores en el Museo del Ferrocarril": "Museo del Ferrocarril Madrid Delicias",
  "Atardecer en la azotea del Círculo de Bellas Artes": "Círculo de Bellas Artes Madrid edificio",
  "Subir al Faro de Moncloa": "Faro de Moncloa Madrid",
  "Atardecer gratis en el Templo de Debod": "Templo de Debod Madrid atardecer",
  "Museos gratis en las tardes de Madrid": "Museo del Prado Madrid edificio",
  "Cine de verano gratis en el Parque de Santander": "open air cinema night",
  "ABBA Sinfónico: clausura de Veranos de la Villa": "orquesta sinfónica concierto auditorio",
  "Eclipse solar casi total sobre Madrid": "partial solar eclipse",
  "Verbenas castizas de agosto": "Fiestas de la Paloma Madrid",
  "Festival Río Babel": "music festival crowd concert",
  "Mad Cool, 10º aniversario": "Mad Cool Festival",
  "Concierto en las Noches del Botánico": "Real Jardín Botánico Madrid",
  "La Tomatina de Buñol": "Tomatina Buñol",
  "Sonorama Ribera en Aranda de Duero": "Aranda de Duero plaza mayor",
  "Chollo de vuelo a Marrakech": "Marrakech Jemaa el Fna",
  "Escapada exprés a Segovia en bus": "Acueducto de Segovia",
};

const slug = (s) =>
  s.normalize("NFD").replace(/[^\x00-\x7F]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findImage(q) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*" +
    "&generator=search&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1280&gsrsearch=" +
    encodeURIComponent(q);
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  const j = await r.json();
  const pages = j?.query?.pages ? Object.values(j.query.pages) : [];
  pages.sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
  const cands = pages
    .map((p) => p.imageinfo && p.imageinfo[0])
    .filter(Boolean)
    .filter((i) => /image\/(jpeg|png)/.test(i.mime || ""));
  const landscape = cands.find((i) => (i.width || 0) >= (i.height || 0) && (i.thumbwidth || i.width || 0) >= 800);
  const pick = landscape || cands[0];
  return pick ? pick.thumburl : null;
}

const plans = JSON.parse(fs.readFileSync("data/planes-verano-2026.json", "utf8"));
for (const p of plans) {
  const q = QUERIES[p.title] || p.location || p.title;
  let storageUrl = null;
  try {
    const img = await findImage(q);
    if (img) {
      const dl = await fetch(img, { headers: { "User-Agent": UA } });
      const ct = dl.headers.get("content-type") || "";
      if (dl.ok && /^image\//.test(ct)) {
        const bytes = new Uint8Array(await dl.arrayBuffer());
        const ext = ct.includes("png") ? "png" : "jpg";
        const path = slug(p.title) + "." + ext;
        const up = await fetch(`https://${REF}.supabase.co/storage/v1/object/${BUCKET}/${path}`, {
          method: "POST",
          headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": ct, "x-upsert": "true" },
          body: bytes,
        });
        if (up.ok) storageUrl = `https://${REF}.supabase.co/storage/v1/object/public/${BUCKET}/${path}`;
        else console.error("  upfail " + up.status + " " + (await up.text()).slice(0, 80));
      }
    }
    console.error((storageUrl ? "OK   " : "NULL ") + p.title);
  } catch (e) {
    console.error("ERR  " + p.title + " :: " + e.message);
  }
  p.image_url = storageUrl;
  await sleep(1300);
}
fs.writeFileSync("data/planes-final.json", JSON.stringify(plans, null, 2));
console.error("\nGuardado data/planes-final.json");
