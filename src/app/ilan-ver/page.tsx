import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { LoadForm } from "@/components/load-form";
import { createLoad } from "@/app/actions/loads";
import { formatTrPhone, normalizeTrPhone } from "@/lib/phone";
import { addDays, todayInTurkey } from "@/lib/validation";

export const metadata: Metadata = { title: "İlan Ver" };

export default async function NewLoadPage() {
  const { profile } = await requireProfile("/ilan-ver");
  const today = todayInTurkey();
  const phone = profile.phone ? normalizeTrPhone(profile.phone) : null;

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Yük ilanı ver</h1>
      <p className="mt-1 text-sm text-slate-600">İlanınız yayınlandıktan sonra araç sahipleri sizi doğrudan arayabilir.</p>
      <div className="card mt-5">
        <LoadForm
          submitLabel="İlanı yayınla"
          minDate={today}
          maxDate={addDays(today, 90)}
          onSave={createLoad}
          defaultValues={{
            from_province_code: "",
            from_district: "",
            to_province_code: "",
            to_district: "",
            cargo_type: "",
            weight_tons: "",
            vehicle_type: "tir",
            load_date: today,
            price: "",
            description: "",
            contact_phone: phone ? formatTrPhone(phone) : "",
          }}
        />
      </div>
    </div>
  );
}
