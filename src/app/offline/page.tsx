import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bağlantı yok" };

export default function OfflinePage() {
  return (
    <div className="card text-center">
      <h1 className="text-lg font-bold text-slate-900">İnternet bağlantısı yok</h1>
      <p className="mt-2 text-sm text-slate-600">Bağlantınız geri geldiğinde sayfayı yenileyin.</p>
    </div>
  );
}
