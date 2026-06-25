import { supabase, GROUP_ID } from "@/lib/supabase";
import type { Member } from "@/lib/data";

const PALETTE = [
  "#DE7C5A", "#4FA3A8", "#E2A33C", "#7E8CCF", "#D98AA6", "#5F9E6A",
  "#C8703E", "#6FA0D6", "#D2675E", "#84A65A", "#B07CC9", "#E0871E",
];

const MEMBER_COLS = "id,name,initials,color,photo_url,is_admin";

export async function getMemberByAuthId(userId: string): Promise<Member | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("members")
    .select(MEMBER_COLS)
    .eq("auth_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Member) ?? null;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "?";
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return (a + b).toUpperCase();
}

// Registro: solo nombre. El avatar es un círculo de color con las iniciales.
export async function createMember(opts: { userId: string; name: string }): Promise<Member> {
  if (!supabase) throw new Error("Sin conexión con la base de datos");
  const { userId, name } = opts;

  // El primer registrado de verdad es el admin
  const { count } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .not("auth_id", "is", null);
  const realCount = count ?? 0;
  const color = PALETTE[realCount % PALETTE.length];

  const { data, error } = await supabase
    .from("members")
    .insert({
      group_id: GROUP_ID,
      name,
      initials: initialsOf(name),
      color,
      auth_id: userId,
      is_admin: false, // el admin es un usuario fijo; el resto, usuarios normales
    })
    .select(MEMBER_COLS)
    .single();
  if (error) throw error;
  return data as Member;
}
