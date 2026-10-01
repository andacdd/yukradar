"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { formatTrPhone, normalizeTrMobile } from "@/lib/phone";
import { otpSchema, phoneLoginSchema } from "@/lib/validation";

type PhoneValues = z.infer<typeof phoneLoginSchema>;
type OtpValues = z.infer<typeof otpSchema>;

const RESEND_SECONDS = 60;

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("expired") || m.includes("invalid")) return "Kod hatalı veya süresi dolmuş.";
  if (m.includes("rate") || m.includes("seconds") || m.includes("too many")) return "Çok sık denediniz. Lütfen biraz bekleyin.";
  if (m.includes("sms") || m.includes("provider") || m.includes("hook")) return "SMS gönderilemedi. Lütfen daha sonra tekrar deneyin.";
  if (m.includes("signups not allowed")) return "Yeni kayıtlar şu anda kapalı.";
  return "Bir hata oluştu. Lütfen tekrar deneyin.";
}

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const phoneForm = useForm<PhoneValues>({ resolver: zodResolver(phoneLoginSchema), defaultValues: { phone: "" } });
  const otpForm = useForm<OtpValues>({ resolver: zodResolver(otpSchema), defaultValues: { token: "" } });

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendCode(target: string) {
    setServerError(null);
    const supabase = createClient();
    if (!supabase) {
      setServerError("Supabase yapılandırılmamış.");
      return false;
    }
    const { error } = await supabase.auth.signInWithOtp({ phone: target, options: { channel: "sms" } });
    if (error) {
      setServerError(translateAuthError(error.message));
      return false;
    }
    setCooldown(RESEND_SECONDS);
    return true;
  }

  const onPhoneSubmit = phoneForm.handleSubmit(async (values) => {
    const normalized = normalizeTrMobile(values.phone);
    if (!normalized) return;
    if (await sendCode(normalized)) setPhone(normalized);
  });

  const onOtpSubmit = otpForm.handleSubmit(async (values) => {
    if (!phone) return;
    setServerError(null);
    const supabase = createClient();
    if (!supabase) {
      setServerError("Supabase yapılandırılmamış.");
      return;
    }
    const { error } = await supabase.auth.verifyOtp({ phone, token: values.token, type: "sms" });
    if (error) {
      setServerError(translateAuthError(error.message));
      return;
    }
    router.replace(`/auth/devam?next=${encodeURIComponent(next)}`);
    router.refresh();
  });

  if (!phone) {
    return (
      <form onSubmit={onPhoneSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="phone" className="field-label">
            Cep telefonu
          </label>
          <div className="flex items-stretch gap-2">
            <span className="grid place-items-center rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-slate-600">
              +90
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="5XX XXX XX XX"
              className="field-input"
              {...phoneForm.register("phone")}
            />
          </div>
          {phoneForm.formState.errors.phone && <p className="field-error">{phoneForm.formState.errors.phone.message}</p>}
        </div>
        {serverError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
        <button type="submit" className="btn-primary w-full" disabled={phoneForm.formState.isSubmitting}>
          {phoneForm.formState.isSubmitting ? "Gönderiliyor..." : "SMS kodu gönder"}
        </button>
        <p className="text-xs text-slate-500">
          Devam ederek telefon numaranızın giriş amacıyla işlenmesine ilişkin{" "}
          <Link href="/kvkk" className="underline" target="_blank">
            KVKK Aydınlatma Metni
          </Link>
          &apos;ni okuduğunuzu kabul edersiniz.
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={onOtpSubmit} noValidate className="space-y-4">
      <p className="text-sm text-slate-700">
        <strong>{formatTrPhone(phone)}</strong> numarasına gönderilen 6 haneli kodu girin.
      </p>
      <div>
        <label htmlFor="token" className="field-label">
          Doğrulama kodu
        </label>
        <input
          id="token"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          className="field-input text-center text-xl tracking-[0.5em]"
          {...otpForm.register("token")}
        />
        {otpForm.formState.errors.token && <p className="field-error">{otpForm.formState.errors.token.message}</p>}
      </div>
      {serverError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
      <button type="submit" className="btn-primary w-full" disabled={otpForm.formState.isSubmitting}>
        {otpForm.formState.isSubmitting ? "Doğrulanıyor..." : "Giriş yap"}
      </button>
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          className="text-slate-600 underline"
          onClick={() => {
            setPhone(null);
            setServerError(null);
            otpForm.reset();
          }}
        >
          Numarayı değiştir
        </button>
        <button
          type="button"
          className="font-medium text-brand-700 disabled:text-slate-400"
          disabled={cooldown > 0}
          onClick={() => sendCode(phone)}
        >
          {cooldown > 0 ? `Tekrar gönder (${cooldown})` : "Kodu tekrar gönder"}
        </button>
      </div>
    </form>
  );
}
