// Reemplaza los planes publicados por los de data/planes-final.json y siembra
// algo de asistencia con los miembros demo. Uso: SUPA_PAT=sbp_... node scripts/apply-plans.mjs
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const PAT = process.env.SUPA_PAT;
const REF = "ekrigvydtruusckoqtrf";
const GROUP_ID = "00000000-0000-0000-0000-0000000000aa";
if (!PAT) {
  console.error("Falta SUPA_PAT");
  process.exit(1);
}

const keys = await (
  await fetch(`https://api.supabase.com/v1/projects/${REF}/api-keys?reveal=true`, {
    headers: { Authorization: "Bearer " + PAT },
  })
).json();
const sr = (Array.isArray(keys) ? keys : []).find((k) => k.name === "service_role")?.api_key;
const db = createClient(`https://${REF}.supabase.co`, sr, { auth: { persistSession: false } });

const plans = JSON.parse(fs.readFileSync("data/planes-final.json", "utf8"));

// 1. Borra los publicados actuales (su asistencia cae por cascade)
const del = await db.from("plans").delete().eq("group_id", GROUP_ID).eq("status", "published");
if (del.error) throw del.error;
console.error("publicados borrados");

// 2. Inserta los nuevos
const rows = plans.map((p) => ({
  group_id: GROUP_ID,
  status: "published",
  title: p.title,
  category: p.category,
  stream: p.stream,
  is_atemporal: p.is_atemporal,
  date_text: p.date_text,
  date_long: p.date_long,
  date_start: p.date_start,
  date_end: p.date_end,
  price: p.price,
  price_note: p.price_note,
  location: p.location,
  duration: p.duration,
  description: p.description,
  source_name: p.source_name,
  source_url: p.source_url,
  image_url: p.image_url,
  is_flash: p.is_flash,
  expires_at: p.expires_at,
}));
const ins = await db.from("plans").insert(rows).select("id,title");
if (ins.error) throw ins.error;
console.error("insertados:", ins.data.length);

// 3. Siembra asistencia con miembros demo (auth_id null), dejando a "Tú"/admin fuera
const { data: members } = await db.from("members").select("id").is("auth_id", null);
const memberIds = (members || []).map((m) => m.id);
const seeds = [];
for (const pl of ins.data) {
  const n = Math.floor(Math.random() * 6); // 0..5
  const shuffled = [...memberIds].sort(() => Math.random() - 0.5).slice(0, n);
  for (const mid of shuffled) seeds.push({ plan_id: pl.id, member_id: mid });
}
if (seeds.length) {
  const att = await db.from("attendance").insert(seeds);
  if (att.error) throw att.error;
}
console.error("asistencias sembradas:", seeds.length);
console.error("LISTO");
