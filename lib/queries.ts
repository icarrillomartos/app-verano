import { supabase, GROUP_ID } from "@/lib/supabase";
import type { Member, DBPlan } from "@/lib/data";

export type AppData = {
  members: Member[];
  plans: DBPlan[]; // publicados (Home)
  pending: DBPlan[]; // propuestas a revisar
  attendance: Record<string, string[]>; // plan_id -> [member_id]
};

const PLAN_COLS =
  "id,title,category,stream,is_atemporal,date_text,date_long,date_start,date_end,price,price_note,location,duration,description,source_name,source_url,image_url,is_flash,expires_at,status,proposed_by";

export async function loadAppData(): Promise<AppData | null> {
  if (!supabase) return null;

  const [membersRes, plansRes, pendingRes, attRes] = await Promise.all([
    supabase.from("members").select("id,name,initials,color,photo_url,is_admin").eq("group_id", GROUP_ID),
    supabase.from("plans").select(PLAN_COLS).eq("group_id", GROUP_ID).eq("status", "published"),
    supabase
      .from("plans")
      .select(PLAN_COLS)
      .eq("group_id", GROUP_ID)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase.from("attendance").select("plan_id,member_id"),
  ]);

  if (membersRes.error) throw membersRes.error;
  if (plansRes.error) throw plansRes.error;
  if (pendingRes.error) throw pendingRes.error;
  if (attRes.error) throw attRes.error;

  const attendance: Record<string, string[]> = {};
  for (const row of attRes.data ?? []) {
    (attendance[row.plan_id] ??= []).push(row.member_id);
  }

  return {
    members: (membersRes.data ?? []) as Member[],
    plans: (plansRes.data ?? []) as DBPlan[],
    pending: (pendingRes.data ?? []) as DBPlan[],
    attendance,
  };
}

export async function joinPlan(memberId: string, planId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("attendance")
    .insert({ plan_id: planId, member_id: memberId });
  if (error && error.code !== "23505") throw error;
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

export type ProposalInput = {
  title: string;
  category: string;
  date_text: string;
  price: number;
  location: string;
  description: string;
  source_url: string;
};

export async function proposePlan(memberId: string, p: ProposalInput): Promise<DBPlan> {
  if (!supabase) throw new Error("Sin conexión");
  const { data, error } = await supabase
    .from("plans")
    .insert({
      group_id: GROUP_ID,
      status: "pending",
      proposed_by: memberId,
      title: p.title.trim(),
      category: p.category,
      date_text: p.date_text.trim() || null,
      date_long: p.date_text.trim() || null,
      price: Number.isFinite(p.price) ? p.price : 0,
      location: p.location.trim() || null,
      description: p.description.trim() || null,
      source_url: p.source_url.trim() || null,
      is_atemporal: false,
      is_flash: false,
    })
    .select(PLAN_COLS)
    .single();
  if (error) throw error;
  return data as DBPlan;
}

export async function approvePlan(planId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("plans").update({ status: "published" }).eq("id", planId);
  if (error) throw error;
}

export async function discardPlan(planId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("plans").update({ status: "discarded" }).eq("id", planId);
  if (error) throw error;
}
