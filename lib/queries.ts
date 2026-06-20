import { supabase, GROUP_ID } from "@/lib/supabase";
import type { Member, DBPlan } from "@/lib/data";

export type AppData = {
  members: Member[];
  plans: DBPlan[]; // publicados
  attendance: Record<string, string[]>; // plan_id -> [member_id]
};

const PLAN_COLS =
  "id,title,category,stream,is_atemporal,date_text,date_long,date_start,date_end,price,price_note,location,duration,description,source_name,source_url,image_url,is_flash,expires_at,status";

export async function loadAppData(): Promise<AppData | null> {
  if (!supabase) return null;

  const [membersRes, plansRes, attRes] = await Promise.all([
    supabase.from("members").select("id,name,initials,color,is_admin").eq("group_id", GROUP_ID),
    supabase.from("plans").select(PLAN_COLS).eq("group_id", GROUP_ID).eq("status", "published"),
    supabase.from("attendance").select("plan_id,member_id"),
  ]);

  if (membersRes.error) throw membersRes.error;
  if (plansRes.error) throw plansRes.error;
  if (attRes.error) throw attRes.error;

  const attendance: Record<string, string[]> = {};
  for (const row of attRes.data ?? []) {
    (attendance[row.plan_id] ??= []).push(row.member_id);
  }

  return {
    members: (membersRes.data ?? []) as Member[],
    plans: (plansRes.data ?? []) as DBPlan[],
    attendance,
  };
}

export async function joinPlan(memberId: string, planId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("attendance")
    .insert({ plan_id: planId, member_id: memberId });
  if (error && error.code !== "23505") throw error; // 23505 = ya estaba apuntado
}

export async function leavePlan(memberId: string, planId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("plan_id", planId)
    .eq("member_id", memberId);
  if (error) throw error;
}
