"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { normalizeTrPhone } from "@/lib/phone";
import { firstIssue, removalSchema, type ActionResult, type RemovalFormValues } from "@/lib/validation";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function submitRemovalRequest(loadId: string, values: RemovalFormValues): Promise<ActionResult> {
  if (!UUID_RE.test(loadId)) return { ok: false, error: "Geçersiz ilan." };
  if (!isSupabaseConfigured()) return { ok: false, error: "Sistem şu anda yapılandırılmamış." };

  const parsed = removalSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const phone = normalizeTrPhone(parsed.data.phone);
  if (!phone) return { ok: false, error: "Geçerli bir telefon girin." };

  const supabase = await createClient();
  const { error } = await supabase.from("removal_requests").insert({
    load_id: loadId,
    full_name: parsed.data.full_name,
    phone,
    reason: parsed.data.reason,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Bu ilan için bekleyen bir talebiniz zaten var. En kısa sürede incelenecek." };
    }
    return { ok: false, error: "Talebiniz alınamadı. Lütfen tekrar deneyin." };
  }

  return {
    ok: true,
    message: "Talebiniz alındı. İnceleme sonrası ilan yayından kaldırılacak ve sizinle iletişime geçilebilecek.",
  };
}
