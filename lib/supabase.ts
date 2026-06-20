import { createClient } from "@supabase/supabase-js";

// La URL y la clave "publishable" son PÚBLICAS por diseño (viajan al navegador en
// cualquier caso y están protegidas por las políticas RLS de la base de datos).
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ekrigvydtruusckoqtrf.supabase.co";
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_6Hsumbsje-FETy-XbuVlUQ_4IqNUHv1";

export const isSupabaseConfigured = Boolean(url && anon);

export const supabase = isSupabaseConfigured
  ? createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const GROUP_ID = "00000000-0000-0000-0000-0000000000aa";
