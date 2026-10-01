"use client";

import { useState, type SelectHTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CARGO_SUGGESTIONS, LOAD_VEHICLE_TYPES } from "@/lib/data/options";
import { PROVINCES_SORTED } from "@/lib/data/provinces";
import { loadSchema, type ActionResult, type LoadFormValues } from "@/lib/validation";

type Props = {
  defaultValues: LoadFormValues;
  submitLabel: string;
  minDate: string;
  maxDate: string;
  onSave: (values: LoadFormValues) => Promise<ActionResult>;
};

function ProvinceSelect({ id, ...rest }: { id: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select id={id} className="field-input" {...rest}>
      <option value="">İl seçin</option>
      {PROVINCES_SORTED.map((p) => (
        <option key={p.code} value={String(p.code)}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

export function LoadForm({ defaultValues, submitLabel, minDate, maxDate, onSave }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoadFormValues>({ resolver: zodResolver(loadSchema), defaultValues });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await onSave(values);
    if (!result.ok) setServerError(result.error);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Nereden</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="from_province_code" className="field-label">
              İl
            </label>
            <ProvinceSelect id="from_province_code" {...register("from_province_code")} />
            {errors.from_province_code && <p className="field-error">{errors.from_province_code.message}</p>}
          </div>
          <div>
            <label htmlFor="from_district" className="field-label">
              İlçe <span className="font-normal text-slate-500">(opsiyonel)</span>
            </label>
            <input id="from_district" className="field-input" placeholder="Örn. Gebze" {...register("from_district")} />
            {errors.from_district && <p className="field-error">{errors.from_district.message}</p>}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Nereye</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="to_province_code" className="field-label">
              İl
            </label>
            <ProvinceSelect id="to_province_code" {...register("to_province_code")} />
            {errors.to_province_code && <p className="field-error">{errors.to_province_code.message}</p>}
          </div>
          <div>
            <label htmlFor="to_district" className="field-label">
              İlçe <span className="font-normal text-slate-500">(opsiyonel)</span>
            </label>
            <input id="to_district" className="field-input" placeholder="Örn. Kemalpaşa" {...register("to_district")} />
            {errors.to_district && <p className="field-error">{errors.to_district.message}</p>}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Yük bilgisi</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="cargo_type" className="field-label">
              Yük türü
            </label>
            <input
              id="cargo_type"
              list="cargo-suggestions"
              className="field-input"
              placeholder="Örn. Paletli yük"
              {...register("cargo_type")}
            />
            <datalist id="cargo-suggestions">
              {CARGO_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {errors.cargo_type && <p className="field-error">{errors.cargo_type.message}</p>}
          </div>
          <div>
            <label htmlFor="weight_tons" className="field-label">
              Ağırlık (ton)
            </label>
            <input
              id="weight_tons"
              inputMode="decimal"
              className="field-input"
              placeholder="Örn. 24"
              {...register("weight_tons")}
            />
            {errors.weight_tons && <p className="field-error">{errors.weight_tons.message}</p>}
          </div>
          <div>
            <label htmlFor="vehicle_type" className="field-label">
              Gereken araç tipi
            </label>
            <select id="vehicle_type" className="field-input" {...register("vehicle_type")}>
              {LOAD_VEHICLE_TYPES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
            {errors.vehicle_type && <p className="field-error">{errors.vehicle_type.message}</p>}
          </div>
          <div>
            <label htmlFor="load_date" className="field-label">
              Yükleme tarihi
            </label>
            <input id="load_date" type="date" min={minDate} max={maxDate} className="field-input" {...register("load_date")} />
            {errors.load_date && <p className="field-error">{errors.load_date.message}</p>}
          </div>
          <div>
            <label htmlFor="price" className="field-label">
              Fiyat (TL) <span className="font-normal text-slate-500">(opsiyonel)</span>
            </label>
            <input
              id="price"
              inputMode="decimal"
              className="field-input"
              placeholder="Boş bırakılırsa teklif usulü"
              {...register("price")}
            />
            {errors.price && <p className="field-error">{errors.price.message}</p>}
          </div>
          <div>
            <label htmlFor="contact_phone" className="field-label">
              İletişim telefonu
            </label>
            <input
              id="contact_phone"
              type="tel"
              inputMode="tel"
              className="field-input"
              placeholder="0532 123 45 67"
              {...register("contact_phone")}
            />
            {errors.contact_phone && <p className="field-error">{errors.contact_phone.message}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="description" className="field-label">
            Açıklama <span className="font-normal text-slate-500">(opsiyonel)</span>
          </label>
          <textarea
            id="description"
            rows={4}
            className="field-input"
            placeholder="Palet sayısı, yükleme saati, ödeme şekli vb."
            {...register("description")}
          />
          {errors.description && <p className="field-error">{errors.description.message}</p>}
        </div>
        <p className="text-xs text-slate-500">
          İletişim telefonu yalnızca giriş yapmış kullanıcılara gösterilir.
        </p>
      </section>

      {serverError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}

      <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
        {isSubmitting ? "Kaydediliyor..." : submitLabel}
      </button>
    </form>
  );
}
