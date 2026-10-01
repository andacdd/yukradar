import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  params: Record<string, string>;
};

function hrefFor(params: Record<string, string>, page: number) {
  const sp = new URLSearchParams(params);
  if (page <= 1) sp.delete("sayfa");
  else sp.set("sayfa", String(page));
  const qs = sp.toString();
  return qs ? `/ilanlar?${qs}` : "/ilanlar";
}

export function Pagination({ page, totalPages, params }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-6 flex items-center justify-between gap-3" aria-label="Sayfalama">
      {page > 1 ? (
        <Link href={hrefFor(params, page - 1)} className="btn-secondary">
          ← Önceki
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-slate-600">
        Sayfa {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={hrefFor(params, page + 1)} className="btn-secondary">
          Sonraki →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
