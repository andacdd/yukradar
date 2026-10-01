import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LOAD_OWNER_COLUMNS, loadToFormValues, type LoadOwned } from "@/lib/loads";
import { formatTrPhone } from "@/lib/phone";
import { addDays, todayInTurkey } from "@/lib/validation";
import { LoadForm } from "@/components/load-form";
import { updateLoad } from "@/app/actions/loads";

export const metadata: Metadata = { title: "İlanı düzenle" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditLoadPage({ params }: PageProps<"/ilanlarim/[id]/duzenle">) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { user } = await requireProfile(`/ilanlarim/${id}/duzenle`);

  const supabase = await createClient();
  const { data } = await supabase
    .from("loads")
    .select(LOAD_OWNER_COLUMNS)
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  const load = data as unknown as LoadOwned | null;
  if (!load || load.source !== "user" || load.status === "removed") notFound();

  const today = todayInTurkey();
  const defaults = loadToFormValues(load);
  defaults.contact_phone = formatTrPhone(load.contact_phone);
  if (defaults.load_date < today) defaults.load_date = today;

  return (
    <div>
      <Link href="/ilanlarim" className="text-sm text-brand-700">
        ← İlanlarım
      </Link>
      <h1 className="mt-2 text-xl font-bold text-slate-900">İlanı düzenle</h1>
      <div className="card mt-5">
        <LoadForm
          submitLabel="Değişiklikleri kaydet"
          minDate={today}
          maxDate={addDays(today, 90)}
          onSave={updateLoad.bind(null, id)}
          defaultValues={defaults}
        />
      </div>
    </div>
  );
}
