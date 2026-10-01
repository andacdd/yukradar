import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { routeLabel } from "@/lib/loads";
import { RemovalForm } from "./removal-form";

export const metadata: Metadata = { title: "İlan kaldırma talebi" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function RemovalPage({ params }: PageProps<"/ilanlar/[id]/kaldir">) {
  const { id } = await params;
  if (!UUID_RE.test(id) || !isSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("loads")
    .select("id, from_province, from_district, to_province, to_district, cargo_type")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const route = routeLabel(data);

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Link href={`/ilanlar/${id}`} className="text-sm text-brand-700">
        ← İlana dön
      </Link>
      <h1 className="text-xl font-bold text-slate-900">Bu ilanı kaldır</h1>
      <p className="text-sm text-slate-600">
        6698 sayılı KVKK kapsamında, size ait olan ve WhatsApp gruplarından alınan ilanın yayından kaldırılmasını talep
        edebilirsiniz. Talebiniz incelenerek sonuçlandırılır.
      </p>
      <div className="card text-sm">
        <p className="font-semibold text-slate-900">
          {route.from} → {route.to}
        </p>
        <p className="text-slate-600">{data.cargo_type}</p>
      </div>
      <div className="card">
        <RemovalForm loadId={id} />
      </div>
    </div>
  );
}
