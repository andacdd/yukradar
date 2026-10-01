"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ROLES, VEHICLE_TYPES } from "@/lib/data/options";
import { profileSchema, type ProfileFormValues } from "@/lib/validation";
import { saveProfile } from "@/app/actions/profile";

type Props = {
  isNew: boolean;
  next: string | null;
  defaultValues: ProfileFormValues;
};

export function ProfileForm({ isNew, next, defaultValues }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema), defaultValues });

  const role = useWatch({ control, name: "role" });
  const isCarrier = role === "carrier" || role === "both";

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setMessage(null);
    if (isNew && !values.kvkk) {
      setError("kvkk", { message: "Kayıt için aydınlatma metnini onaylamalısınız" });
      return;
    }
    const result = await saveProfile(values, next);
    if (!result.ok) setServerError(result.error);
    else setMessage(result.message ?? "Kaydedildi.");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="full_name" className="field-label">
          Ad soyad
        </label>
        <input id="full_name" autoComplete="name" className="field-input" {...register("full_name")} />
        {errors.full_name && <p className="field-error">{errors.full_name.message}</p>}
      </div>

      <fieldset>
        <legend className="field-label">Rolünüz</legend>
        <div className="grid gap-2">
          {ROLES.map((r) => (
            <label
              key={r.value}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-300 p-3 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50"
            >
              <input type="radio" value={r.value} className="mt-1 h-4 w-4" {...register("role")} />
              <span>
                <span className="block text-sm font-semibold text-slate-900">{r.label}</span>
                <span className="block text-xs text-slate-600">{r.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.role && <p className="field-error">{errors.role.message}</p>}
      </fieldset>

      {isCarrier && (
        <>
          <div>
            <label htmlFor="vehicle_type" className="field-label">
              Araç tipi
            </label>
            <select id="vehicle_type" className="field-input" {...register("vehicle_type")}>
              <option value="">Seçin</option>
              {VEHICLE_TYPES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
            {errors.vehicle_type && <p className="field-error">{errors.vehicle_type.message}</p>}
          </div>
          <div>
            <label htmlFor="plate" className="field-label">
              Plaka <span className="font-normal text-slate-500">(opsiyonel)</span>
            </label>
            <input
              id="plate"
              placeholder="34 ABC 123"
              autoCapitalize="characters"
              className="field-input uppercase"
              {...register("plate")}
            />
            {errors.plate && <p className="field-error">{errors.plate.message}</p>}
          </div>
        </>
      )}

      {isNew && (
        <div>
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0" {...register("kvkk")} />
            <span>
              <Link href="/kvkk" target="_blank" className="font-medium text-brand-700 underline">
                KVKK Aydınlatma Metni
              </Link>
              &apos;ni okudum; kişisel verilerimin üyelik ve ilan hizmetinin sunulması amacıyla işlenmesini kabul ediyorum.
            </span>
          </label>
          {errors.kvkk && <p className="field-error">{errors.kvkk.message}</p>}
        </div>
      )}

      {serverError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
      {message && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{message}</p>}

      <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
        {isSubmitting ? "Kaydediliyor..." : isNew ? "Kaydı tamamla" : "Kaydet"}
      </button>
    </form>
  );
}
