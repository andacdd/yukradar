import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Role, VehicleType } from "@/lib/data/options";

export type Profile = {
  id: string;
  full_name: string;
  role: Role;
  vehicle_type: VehicleType | null;
  plate: string | null;
  phone: string | null;
  kvkk_accepted_at: string;
};

export const getUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, vehicle_type, plate, phone, kvkk_accepted_at")
    .eq("id", user.id)
    .maybeSingle();
  return (data as Profile | null) ?? null;
});

export function safeNext(next: string | null | undefined, fallback = "/ilanlar"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

export async function requireUser(next: string): Promise<User> {
  await connection();
  const user = await getUser();
  if (!user) redirect(`/giris?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireProfile(next: string): Promise<{ user: User; profile: Profile }> {
  const user = await requireUser(next);
  const profile = await getProfile();
  if (!profile) redirect(`/profil?next=${encodeURIComponent(next)}`);
  return { user, profile };
}
