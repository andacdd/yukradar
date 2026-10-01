import Link from "next/link";
import { getProfile, getUser } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";

export async function Header() {
  const user = await getUser();
  const profile = user ? await getProfile() : null;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-brand-900/20 bg-brand-600 text-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-400 text-brand-900">Y</span>
            Yük Bulma
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            <Link href="/ilanlar" className="rounded-lg px-3 py-2 hover:bg-white/10">
              İlanlar
            </Link>
            <Link href="/ilan-ver" className="rounded-lg px-3 py-2 hover:bg-white/10">
              İlan Ver
            </Link>
            {user && (
              <Link href="/ilanlarim" className="rounded-lg px-3 py-2 hover:bg-white/10">
                İlanlarım
              </Link>
            )}
            {user && (
              <Link href="/profil" className="rounded-lg px-3 py-2 hover:bg-white/10">
                Profil
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <form action={signOut}>
                <button type="submit" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10">
                  Çıkış
                </button>
              </form>
            ) : (
              <Link href="/giris" className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-brand-700">
                Giriş / Kayıt
              </Link>
            )}
          </div>
        </div>
        {user && !profile && (
          <Link href="/profil" className="block bg-accent-400 px-4 py-2 text-center text-sm font-medium text-brand-900">
            Profilinizi tamamlayın, ilan vermeye başlayın →
          </Link>
        )}
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] text-xs font-medium text-slate-600 md:hidden">
        <Link href="/ilanlar" className="flex flex-col items-center gap-0.5 py-2.5">
          <span aria-hidden className="text-lg leading-none">☰</span>
          İlanlar
        </Link>
        <Link href="/ilan-ver" className="flex flex-col items-center gap-0.5 py-2.5 text-brand-700">
          <span aria-hidden className="text-lg leading-none">＋</span>
          İlan Ver
        </Link>
        <Link href="/ilanlarim" className="flex flex-col items-center gap-0.5 py-2.5">
          <span aria-hidden className="text-lg leading-none">▤</span>
          İlanlarım
        </Link>
        <Link href={user ? "/profil" : "/giris"} className="flex flex-col items-center gap-0.5 py-2.5">
          <span aria-hidden className="text-lg leading-none">◉</span>
          {user ? "Profil" : "Giriş"}
        </Link>
      </nav>
    </>
  );
}
