import { createClient } from "@supabase/supabase-js";

// La URL y la clave "publishable" son PÚBLICAS por diseño (viajan al navegador en
// cualquier caso y están protegidas por las políticas RLS de la base de datos).
// Se pueden sobrescribir por variable de entorno; si no, se usan estos valores por
// defecto para que el deploy funcione sin configurar nada en Vercel.
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ekrigvydtruusckoqtrf.supabase.co";
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_6Hsumbsje-FETy-XbuVlUQ_4IqNUHv1";

export const isSupabaseConfigured = Boolean(url && anon);

export const supabase = isSupabaseConfigured ? createClient(url, anon) : null;

// El usuario actual hasta que exista login real (Fase 3): el miembro "Tú" sembrado.
export const CURRENT_MEMBER_ID = "00000000-0000-0000-0000-000000000001";
export const GROUP_ID = "00000000-0000-0000-0000-0000000000aa";
