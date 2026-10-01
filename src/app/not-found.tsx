import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card text-center">
      <h1 className="text-lg font-bold text-slate-900">Sayfa bulunamadı</h1>
      <p className="mt-2 text-sm text-slate-600">Aradığınız ilan kaldırılmış veya süresi dolmuş olabilir.</p>
      <Link href="/ilanlar" className="btn-primary mt-4">
        İlanlara dön
      </Link>
    </div>
  );
}
