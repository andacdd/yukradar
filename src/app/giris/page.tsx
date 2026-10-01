import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser, safeNext } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Giriş / Kayıt" };

export default async function LoginPage({ searchParams }: PageProps<"/giris">) {
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : null);
  const user = await getUser();
  if (user) redirect(`/auth/devam?next=${encodeURIComponent(next)}`);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-bold text-slate-900">Giriş / Kayıt</h1>
      <p className="mt-1 text-sm text-slate-600">
        Cep telefonu numaranı gir, SMS ile gelen kodla giriş yap. İlk girişte kısa bir profil formu doldurursun.
      </p>
      <div className="card mt-5">
        <LoginForm next={next} />
      </div>
    </div>
  );
}
