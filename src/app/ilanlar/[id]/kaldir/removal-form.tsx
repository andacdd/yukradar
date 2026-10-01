"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { removalSchema, type RemovalFormValues } from "@/lib/validation";
import { submitRemovalRequest } from "@/app/actions/removal";

export function RemovalForm({ loadId }: { loadId: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RemovalFormValues>({
    resolver: zodResolver(removalSchema),
    defaultValues: { full_name: "", phone: "", reason: "", consent: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await submitRemovalRequest(loadId, values);
    if (result.ok) setDone(result.message ?? "Talebiniz alındı.");
    else setServerError(result.error);
  });

  if (done) {
    return <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{done}</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="full_name" className="field-label">
          Ad soyad
        </label>
        <input id="full_name" autoComplete="name" className="field-input" {...register("full_name")} />
        {errors.full_name && <p className="field-error">{errors.full_name.message}</p>}
      </div>
      <div>
        <label htmlFor="phone" className="field-label">
          İlandaki telefon numarası
        </label>
        <input id="phone" type="tel" inputMode="tel" placeholder="0532 123 45 67" className="field-input" {...register("phone")} />
        {errors.phone && <p className="field-error">{errors.phone.message}</p>}
      </div>
      <div>
        <label htmlFor="reason" className="field-label">
          Açıklama
        </label>
        <textarea
          id="reason"
          rows={4}
          className="field-input"
          placeholder="Örn. Bu ilan bana ait, yük verildi / izinsiz paylaşıldı."
          {...register("reason")}
        />
        {errors.reason && <p className="field-error">{errors.reason.message}</p>}
      </div>
      <label className="flex items-start gap-3 text-sm text-slate-700">
        <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0" {...register("consent")} />
        <span>
          Talebimin değerlendirilmesi için ad ve telefon bilgimin işlenmesini kabul ediyorum.{" "}
          <Link href="/kvkk" target="_blank" className="text-brand-700 underline">
            KVKK Aydınlatma Metni
          </Link>
        </span>
      </label>
      {errors.consent && <p className="field-error">{errors.consent.message}</p>}
      {serverError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
      <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
        {isSubmitting ? "Gönderiliyor..." : "Kaldırma talebi gönder"}
      </button>
    </form>
  );
}
