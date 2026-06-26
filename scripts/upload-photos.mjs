// Descarga cada foto de Wikimedia y la sube a Supabase Storage (bucket público
// plan-photos). Emite data/fotos-storage.json [{title, storage_url}].
import fs from "node:fs";

const REF = "ekrigvydtruusckoqtrf";
const KEY = "sb_publishable_6Hsumbsje-FETy-XbuVlUQ_4IqNUHv1";
const BUCKET = "plan-photos";
const UA = "LaCuadrillaApp/1.0 (admin@example.com)";

const arr = JSON.parse(fs.readFileSync("data/fotos.json", "utf8"));

// Parche: si "Paddle surf y kayak en San Juan" no tiene foto, reutiliza la del pantano.
const banoSanJuan = arr.find((x) => x.title === "Baño en el Pantano de San Juan");
for (const x of arr) {
  if (!x.image_url && x.title.includes("Paddle surf") && banoSanJuan) {
    x.image_url = banoSanJuan.image_url;
  }
}

const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const out = [];
for (const { title, image_url } of arr) {
  if (!image_url) {
    out.push({ title, storage_url: null });
    console.error("NULL  " + title);
    continue;
  }
  try {
    const dl = await fetch(image_url, { headers: { "User-Agent": UA } });
    const ct = dl.headers.get("content-type") || "";
    if (!dl.ok || !/^image\//.test(ct)) {
      out.push({ title, storage_url: null });
      console.error("SKIP " + dl.status + " " + ct + "  " + title);
      await sleep(1300);
      continue;
    }
    const bytes = new Uint8Array(await dl.arrayBuffer());
    const ext = ct.includes("png") ? "png" : "jpg";
    const path = slug(title) + "." + ext;
    const up = await fetch(
      `https://${REF}.supabase.co/storage/v1/object/${BUCKET}/${path}`,
      {
        method: "POST",
        headers: {
          apikey: KEY,
          Authorization: "Bearer " + KEY,
          "Content-Type": ct,
          "x-upsert": "true",
        },
        body: bytes,
      }
    );
    if (!up.ok) {
      const t = await up.text();
      out.push({ title, storage_url: null });
      console.error("UPFAIL " + up.status + " " + t.slice(0, 120) + "  " + title);
    } else {
      const url = `https://${REF}.supabase.co/storage/v1/object/public/${BUCKET}/${path}`;
      out.push({ title, storage_url: url });
      console.error("OK   " + Math.round(bytes.length / 1024) + "KB  " + title);
    }
  } catch (e) {
    out.push({ title, storage_url: null });
    console.error("ERR  " + title + " :: " + e.message);
  }
  await sleep(1300);
}

fs.writeFileSync("data/fotos-storage.json", JSON.stringify(out, null, 2));
console.error("\nGuardado data/fotos-storage.json");
