"use client";

export default function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  // Build a compact page number list: 1 … (p-1) p (p+1) … last
  function pageNumbers() {
    const pages = [];
    const add = (n) => pages.push(n);
    add(1);
    if (page > 3) pages.push("…");
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
      add(p);
    }
    if (page < totalPages - 2) pages.push("…");
    if (totalPages > 1) add(totalPages);
    return [...new Set(pages)];
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <p className="text-sm text-mist-400">
        Showing <span className="text-mist-200">{start}–{end}</span> of{" "}
        <span className="text-mist-200">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          className="btn-secondary !py-1.5 !px-3 text-xs"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Prev
        </button>

        {pageNumbers().map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-2 text-mist-500 text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-mono transition-colors ${
                p === page
                  ? "bg-accent text-ink-950 font-semibold"
                  : "bg-ink-800 text-mist-300 hover:bg-ink-700 border border-ink-600"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          className="btn-secondary !py-1.5 !px-3 text-xs"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>

      <select
        className="input !w-auto !py-1.5 text-xs"
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
      >
        {[10, 20, 50].map((n) => (
          <option key={n} value={n}>
            {n} / page
          </option>
        ))}
      </select>
    </div>
  );
}
