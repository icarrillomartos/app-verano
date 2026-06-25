import { createClient } from "@supabase/supabase-js";

// La URL y la clave "publishable" son PÚBLICAS por diseño (viajan al navegador en
// cualquier caso y están protegidas por las políticas RLS de la base de datos).
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ekrigvydtruusckoqtrf.supabase.co";
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_6Hsumbsje-FETy-XbuVlUQ_4IqNUHv1";

export const isSupabaseConfigured = Boolean(url && anon);

// Auth por email + contraseña (sin emails): la sesión se establece dentro de la
// app, así que funciona en la PWA instalada y no depende de límites de email.
export const supabase = isSupabaseConfigured
  ? createClient(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : null;

export const GROUP_ID = "00000000-0000-0000-0000-0000000000aa";
