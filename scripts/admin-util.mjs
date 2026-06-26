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

if (action === "create-admin") {
  const GROUP_ID = "00000000-0000-0000-0000-0000000000aa";
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PW;
  if (!password) {
    console.error("Falta ADMIN_PW (la contraseña del admin)");
    process.exit(1);
  }
  // Crea (o recupera) el usuario auth confirmado
  let userId;
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error) {
    const { data } = await admin.auth.admin.listUsers();
    userId = (data?.users || []).find((u) => u.email === email)?.id;
    console.log("usuario ya existía:", userId);
  } else {
    userId = created.data.user.id;
    console.log("usuario creado:", userId);
  }
  if (!userId) {
    console.error("no se pudo obtener userId");
    process.exit(1);
  }
  // Miembro admin (upsert por auth_id)
  const { data: existing } = await admin.from("members").select("id").eq("auth_id", userId).maybeSingle();
  if (existing) {
    await admin.from("members").update({ is_admin: true, name: "Iván" }).eq("id", existing.id);
    console.log("miembro admin actualizado");
  } else {
    const { error } = await admin.from("members").insert({
      group_id: GROUP_ID,
      name: "Iván",
      initials: "IV",
      color: "#E0455E",
      auth_id: userId,
      is_admin: true,
    });
    if (error) {
      console.error("error insertando miembro:", error.message);
      process.exit(1);
    }
    console.log("miembro admin creado");
  }
} else if (action === "del-nonadmin") {
  // Borra usuarios auth que NO sean el admin fijo
  const keep = "admin@example.com";
  const { data } = await admin.auth.admin.listUsers();
  let n = 0;
  for (const u of data?.users || []) {
    if ((u.email || "") !== keep) {
      await admin.auth.admin.deleteUser(u.id);
      n++;
    }
  }
  console.log("usuarios no-admin borrados:", n);
} else if (action === "wipe-users") {
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
