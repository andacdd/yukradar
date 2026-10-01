import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getUser } from "@/lib/auth";
import { LOAD_DETAIL_COLUMNS, formatDate, formatPrice, formatRelative, formatWeight, routeLabel, type LoadDetail } from "@/lib/loads";
import { formatKm, haversineKm, pointOrProvince } from "@/lib/geo";
import { LOAD_STATUS_LABELS, vehicleLabel } from "@/lib/data/options";
import { formatTrPhone, isTrMobile, whatsappLink } from "@/lib/phone";
import { SourceBadge } from "@/components/source-badge";
import { RouteMap } from "@/components/map/route-map";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const fetchLoad = cache(async (id: string): Promise<LoadDetail | null> => {
  if (!UUID_RE.test(id) || !isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("loads").select(LOAD_DETAIL_COLUMNS).eq("id", id).maybeSingle();
  return (data as unknown as LoadDetail | null) ?? null;
});

export async function generateMetadata({ params }: PageProps<"/ilanlar/[id]">): Promise<Metadata> {
  const { id } = await params;
  const load = await fetchLoad(id);
  if (!load) return { title: "İlan bulunamadı" };
  return { title: `${load.from_province} → ${load.to_province} ${load.cargo_type}` };
}

export default async function LoadDetailPage({ params, searchParams }: PageProps<"/ilanlar/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const load = await fetchLoad(id);
  if (!load) notFound();

  const user = await getUser();
  let contactPhone: string | null = null;
  let isOwner = false;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase.from("loads").select("contact_phone, owner_id").eq("id", id).maybeSingle();
    contactPhone = (data?.contact_phone as string | undefined) ?? null;
    isOwner = data?.owner_id === user.id;
  }

  const route = routeLabel(load);
  const pickup = pointOrProvince(load.pickup_point, load.from_province_code);
  const delivery = pointOrProvince(load.delivery_point, load.to_province_code);
  const distanceKm = pickup && delivery ? haversineKm(pickup, delivery) : null;
  const waText = `Merhaba, Yük Bulma'daki ${load.from_province} → ${load.to_province} (${load.cargo_type}, ${formatWeight(load.weight_tons)}) ilanınız için yazıyorum.`;

  return (
    <div className="space-y-4">
      <Link href="/ilanlar" className="text-sm text-brand-700">
        ← İlanlara dön
      </Link>

      {sp.yeni === "1" && (
        <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">İlanınız yayınlandı.</p>
      )}
      {load.status !== "active" && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Bu ilanın durumu: {LOAD_STATUS_LABELS[load.status] ?? load.status}
        </p>
      )}

      <article className="card space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {load.source === "whatsapp" && <SourceBadge />}
            <span className="text-xs text-slate-500">{formatRelative(load.created_at)}</span>
          </div>
          <h1 className="mt-2 text-xl font-bold text-slate-900">
            {route.from} <span className="text-slate-400">→</span> {route.to}
          </h1>
          <p className="text-slate-600">{load.cargo_type}</p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Ağırlık</dt>
            <dd className="font-semibold text-slate-900">{formatWeight(load.weight_tons)}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Araç tipi</dt>
            <dd className="font-semibold text-slate-900">{vehicleLabel(load.vehicle_type)}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Yükleme tarihi</dt>
            <dd className="font-semibold text-slate-900">{formatDate(load.load_date)}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Fiyat</dt>
            <dd className="font-semibold text-slate-900">{formatPrice(load.price, load.currency)}</dd>
          </div>
        </dl>

        {pickup && delivery && (
          <section aria-labelledby="harita-baslik" className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="harita-baslik" className="text-sm font-semibold text-slate-700">
                Güzergâh
              </h2>
              {distanceKm !== null && (
                <p className="text-sm text-slate-700">
                  Kuş uçuşu <strong className="text-slate-900">{formatKm(distanceKm)}</strong>
                </p>
              )}
            </div>
            <RouteMap pickup={pickup} delivery={delivery} pickupLabel={route.from} deliveryLabel={route.to} />
            <p className="text-xs text-slate-500">
              Noktalar il merkezini gösterir; çizgi düz hattır, gerçek yol mesafesi daha uzundur.
            </p>
          </section>
        )}

        {load.description && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Açıklama</h2>
            <p className="mt-1 text-sm whitespace-pre-line text-slate-800">{load.description}</p>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4">
          {contactPhone ? (
            <div className="space-y-3">
              <p className="text-center text-lg font-semibold text-slate-900">{formatTrPhone(contactPhone)}</p>
              <div className="grid grid-cols-2 gap-3">
                <a href={`tel:${contactPhone}`} className="btn-primary">
                  Ara
                </a>
                {isTrMobile(contactPhone) ? (
                  <a href={whatsappLink(contactPhone, waText)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                    WhatsApp
                  </a>
                ) : (
                  <span className="btn-secondary opacity-60">WhatsApp yok</span>
                )}
              </div>
            </div>
          ) : user ? (
            <p className="text-center text-sm text-slate-600">İletişim bilgisi bulunamadı.</p>
          ) : (
            <div className="space-y-3 text-center">
              <p className="text-sm text-slate-600">Telefon numarasını görmek ve aramak için giriş yapın.</p>
              <Link href={`/giris?next=${encodeURIComponent(`/ilanlar/${load.id}`)}`} className="btn-primary w-full">
                Giriş yap ve numarayı gör
              </Link>
            </div>
          )}
        </div>
      </article>

      {isOwner && (
        <Link href={`/ilanlarim/${load.id}/duzenle`} className="btn-secondary w-full">
          İlanı düzenle
        </Link>
      )}

      {load.source === "whatsapp" && (
        <div className="card text-sm text-slate-600">
          <p>
            Bu ilan herkese açık bir WhatsApp grubundan otomatik olarak alınmıştır. İlan size aitse ve yayından kaldırılmasını
            istiyorsanız başvurabilirsiniz.
          </p>
          <Link href={`/ilanlar/${load.id}/kaldir`} className="mt-3 inline-block font-medium text-red-700 underline">
            Bu ilanı kaldır
          </Link>
        </div>
      )}
    </div>
  );
}
