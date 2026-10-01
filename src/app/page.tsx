import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-brand-900 p-6 text-white">
        <h1 className="text-2xl leading-tight font-bold sm:text-3xl">Boş dönme, yükünü bul.</h1>
        <p className="mt-2 text-sm text-blue-100 sm:text-base">
          Tır, kamyon ve kamyonet sahipleri Türkiye genelindeki yük ilanlarını tek yerden görür. Yük sahipleri ücretsiz ilan
          verir, araç sahipleri doğrudan arar.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/ilanlar" className="btn bg-accent-400 text-brand-900 hover:bg-accent-500">
            Yük ilanlarına bak
          </Link>
          <Link href="/ilan-ver" className="btn border border-white/40 text-white hover:bg-white/10">
            Ücretsiz ilan ver
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm font-semibold text-slate-900">1. Telefonla giriş</p>
          <p className="mt-1 text-sm text-slate-600">Şifre yok. Cep telefonuna gelen SMS koduyla giriş yap.</p>
        </div>
        <div className="card">
          <p className="text-sm font-semibold text-slate-900">2. Filtrele</p>
          <p className="mt-1 text-sm text-slate-600">Nereden, nereye, araç tipi, tarih ve tonaja göre yükleri süz.</p>
        </div>
        <div className="card">
          <p className="text-sm font-semibold text-slate-900">3. Ara veya yaz</p>
          <p className="mt-1 text-sm text-slate-600">Yük sahibini tek dokunuşla ara ya da WhatsApp&apos;tan yaz.</p>
        </div>
      </section>
    </div>
  );
}
