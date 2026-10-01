"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getUser, safeNext } from "@/lib/auth";
import { firstIssue, normalizePlate, profileSchema, type ActionResult, type ProfileFormValues } from "@/lib/validation";

export async function saveProfile(values: ProfileFormValues, next: string | null): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın." };

  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const existing = await getProfile();
  if (!existing && !parsed.data.kvkk) {
    return { ok: false, error: "Kayıt için KVKK Aydınlatma Metni'ni onaylamanız gerekir." };
  }

  const isCarrier = parsed.data.role !== "shipper";
  const plate = isCarrier ? normalizePlate(parsed.data.plate) : "";
  const row = {
    full_name: parsed.data.full_name,
    role: parsed.data.role,
    vehicle_type: isCarrier ? parsed.data.vehicle_type : null,
    plate: plate === "" ? null : plate,
  };

  const supabase = await createClient();
  const { error } = existing
    ? await supabase.from("profiles").update(row).eq("id", user.id)
    : await supabase.from("profiles").insert({ id: user.id, ...row });

  if (error) return { ok: false, error: "Profil kaydedilemedi. Lütfen tekrar deneyin." };

  revalidatePath("/", "layout");
  if (!existing) redirect(safeNext(next));
  return { ok: true, message: "Profiliniz güncellendi." };
}
