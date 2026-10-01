import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { Header } from "@/components/header";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: { default: "Yük Bulma", template: "%s | Yük Bulma" },
  description: "Tır ve kamyon sahipleri için yük bulma, yük sahipleri için ücretsiz ilan platformu.",
  applicationName: "Yük Bulma",
  appleWebApp: { capable: true, title: "Yük Bulma", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: { apple: "/pwa-icon/192" },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Header />
        {!isSupabaseConfigured() && (
          <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
            Supabase bağlantısı yapılandırılmamış. <code>.env.local</code> dosyasını README&apos;ye göre doldurun.
          </div>
        )}
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">{children}</main>
        <footer className="border-t border-slate-200 bg-white px-4 pt-4 pb-20 text-center text-xs text-slate-500 md:pb-4">
          <Link href="/kvkk" className="underline">
            KVKK Aydınlatma Metni
          </Link>
          <span className="mx-2">·</span>
          <span>Yük Bulma</span>
        </footer>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
