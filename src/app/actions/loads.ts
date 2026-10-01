"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getUser } from "@/lib/auth";
import { buildLoadPayload } from "@/lib/loads";
import { firstIssue, loadSchema, type ActionResult, type LoadFormValues } from "@/lib/validation";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function requireOwnerContext() {
  const user = await getUser();
  if (!user) return null;
  const profile = await getProfile();
  if (!profile) return null;
  return { user, supabase: await createClient() };
}

export async function createLoad(values: LoadFormValues): Promise<ActionResult> {
  const ctx = await requireOwnerContext();
  if (!ctx) return { ok: false, error: "İlan vermek için giriş yapıp profilinizi tamamlamalısınız." };

  const parsed = loadSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const payload = buildLoadPayload(parsed.data);
  if (!payload) return { ok: false, error: "Form bilgileri geçersiz." };

  const { data, error } = await ctx.supabase
    .from("loads")
    .insert({ ...payload, owner_id: ctx.user.id })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: "İlan kaydedilemedi. Lütfen tekrar deneyin." };

  revalidatePath("/ilanlar");
  revalidatePath("/ilanlarim");
  redirect(`/ilanlar/${data.id}?yeni=1`);
}

export async function updateLoad(id: string, values: LoadFormValues): Promise<ActionResult> {
  if (!UUID_RE.test(id)) return { ok: false, error: "Geçersiz ilan." };
  const ctx = await requireOwnerContext();
  if (!ctx) return { ok: false, error: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın." };

  const parsed = loadSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const payload = buildLoadPayload(parsed.data);
  if (!payload) return { ok: false, error: "Form bilgileri geçersiz." };

  const { data, error } = await ctx.supabase
    .from("loads")
    .update(payload)
    .eq("id", id)
    .eq("owner_id", ctx.user.id)
    .select("id");

  if (error) return { ok: false, error: "İlan güncellenemedi. Lütfen tekrar deneyin." };
  if (!data || data.length === 0) return { ok: false, error: "İlan bulunamadı veya düzenleme yetkiniz yok." };

  revalidatePath("/ilanlar");
  revalidatePath(`/ilanlar/${id}`);
  revalidatePath("/ilanlarim");
  redirect("/ilanlarim?guncellendi=1");
}

export async function deleteLoad(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return;
  const ctx = await requireOwnerContext();
  if (!ctx) redirect("/giris?next=/ilanlarim");

  await ctx.supabase.from("loads").delete().eq("id", id).eq("owner_id", ctx.user.id);
  revalidatePath("/ilanlar");
  revalidatePath("/ilanlarim");
}

export async function setLoadStatus(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!UUID_RE.test(id) || (status !== "active" && status !== "found")) return;
  const ctx = await requireOwnerContext();
  if (!ctx) redirect("/giris?next=/ilanlarim");

  await ctx.supabase.from("loads").update({ status }).eq("id", id).eq("owner_id", ctx.user.id);
  revalidatePath("/ilanlar");
  revalidatePath(`/ilanlar/${id}`);
  revalidatePath("/ilanlarim");
}
