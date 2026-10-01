import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LOAD_OWNER_COLUMNS, formatDate, isExpired, formatWeight, routeLabel, type LoadOwned } from "@/lib/loads";
import { LOAD_STATUS_LABELS } from "@/lib/data/options";
import { deleteLoad, setLoadStatus } from "@/app/actions/loads";
import { ConfirmSubmit } from "@/components/confirm-submit";

export const metadata: Metadata = { title: "İlanlarım" };

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  found: "bg-slate-200 text-slate-700",
  removed: "bg-red-100 text-red-800",
};

export default async function MyLoadsPage({ searchParams }: PageProps<"/ilanlarim">) {
  const sp = await searchParams;
  const { user } = await requireProfile("/ilanlarim");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loads")
    .select(LOAD_OWNER_COLUMNS)
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const loads = (data ?? []) as unknown as LoadOwned[];

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">İlanlarım</h1>
        <Link href="/ilan-ver" className="btn-primary">
          Yeni ilan
        </Link>
      </div>

      {sp.guncellendi === "1" && (
        <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">İlan güncellendi.</p>
      )}
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">İlanlar yüklenemedi.</p>}

      <div className="mt-4 space-y-3">
        {loads.length === 0 && !error && (
          <div className="card text-center text-sm text-slate-600">
            Henüz ilanınız yok.{" "}
            <Link href="/ilan-ver" className="font-medium text-brand-700 underline">
              İlk ilanını ver
            </Link>
          </div>
        )}
        {loads.map((load) => {
          const route = routeLabel(load);
          const expired = load.status === "active" && isExpired(load.expires_at);
          return (
            <div key={load.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/ilanlar/${load.id}`} className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {route.from} → {route.to}
                  </p>
                  <p className="text-sm text-slate-600">
                    {load.cargo_type} · {formatWeight(load.weight_tons)} · {formatDate(load.load_date)}
                  </p>
                </Link>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[load.status] ?? ""}`}>
                  {expired ? "Süresi doldu" : (LOAD_STATUS_LABELS[load.status] ?? load.status)}
                </span>
              </div>
              {load.status !== "removed" && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Link href={`/ilanlarim/${load.id}/duzenle`} className="btn-secondary px-2">
                    Düzenle
                  </Link>
                  <form action={setLoadStatus}>
                    <input type="hidden" name="id" value={load.id} />
                    <input type="hidden" name="status" value={load.status === "active" && !expired ? "found" : "active"} />
                    <button type="submit" className="btn-secondary w-full px-2">
                      {load.status === "active" && !expired ? "Kapat" : "Yeniden yayınla"}
                    </button>
                  </form>
                  <form action={deleteLoad}>
                    <input type="hidden" name="id" value={load.id} />
                    <ConfirmSubmit message="Bu ilan kalıcı olarak silinecek. Emin misiniz?" className="btn-danger w-full px-2">
                      Sil
                    </ConfirmSubmit>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        &quot;Kapat&quot; ilanı &quot;Yük bulundu&quot; olarak işaretler ve listeden kaldırır.
      </p>
    </div>
  );
}
