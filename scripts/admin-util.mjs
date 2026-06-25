// Utilidad admin (one-off): obtiene la service_role key vía Management API y
// ejecuta una acción. Uso: SUPA_PAT=sbp_... node scripts/admin-util.mjs <accion>
import { createClient } from "@supabase/supabase-js";

const PAT = process.env.SUPA_PAT;
const REF = "ekrigvydtruusckoqtrf";
const URL = `https://${REF}.supabase.co`;
const action = process.argv[2] || "list";

const keysRes = await fetch(`https://api.supabase.com/v1/projects/${REF}/api-keys?reveal=true`, {
  headers: { Authorization: "Bearer " + PAT },
});
const keys = await keysRes.json();
const sr = (Array.isArray(keys) ? keys : []).find((k) => k.name === "service_role");
if (!sr) {
  console.error("no service_role key");
  process.exit(1);
}
const admin = createClient(URL, sr.api_key, { auth: { persistSession: false } });

if (action === "wipe-users") {
  const { data } = await admin.auth.admin.listUsers();
  let n = 0;
  for (const u of data?.users || []) {
    await admin.auth.admin.deleteUser(u.id);
    n++;
  }
  const { data: d2 } = await admin.auth.admin.listUsers();
  console.log("borrados:", n, "| restantes:", (d2?.users || []).length);
} else {
  const { data } = await admin.auth.admin.listUsers();
  console.log("usuarios:", (data?.users || []).map((u) => u.email));
}
