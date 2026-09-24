"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProductList from "@/components/ProductList";
import Pagination from "@/components/Pagination";
import ConfirmModal from "@/components/ConfirmModal";
import { Loader, EmptyState, ErrorState } from "@/components/StatusStates";
import { useDebounce } from "@/lib/utils/useDebounce";
import {
  fetchProducts,
  fetchProductsByCategory,
  searchProducts,
  fetchCategories,
  deleteProduct,
} from "@/lib/api/products";
import { applyOverrides, addDeletedProduct, getCreatedProducts } from "@/lib/localOverrides";

// --- helpers for safely reading URL params ---
function toSafeInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const PAGE_SIZES = [10, 20, 50];
const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price", label: "Price" },
  { value: "rating", label: "Rating" },
  { value: "title", label: "Title" },
];

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ---- URL is the source of truth for these ----
  const page = toSafeInt(searchParams.get("page"), 1);
  const pageSize = PAGE_SIZES.includes(toSafeInt(searchParams.get("pageSize"), 10))
    ? toSafeInt(searchParams.get("pageSize"), 10)
    : 10;
  const urlQuery = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const order = searchParams.get("order") || "asc";

  // ---- local input state (search box types faster than URL updates) ----
  const [searchInput, setSearchInput] = useState(urlQuery);
  const debouncedSearch = useDebounce(searchInput, 450);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const abortRef = useRef(null);
  const latestRequestId = useRef(0);

  function updateUrl(next) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  // When the debounced search value changes, push it to the URL and
  // reset to page 1. This is also where we enforce "search and category
  // filter can't both be active" — turning search on clears category.
  useEffect(() => {
    if (debouncedSearch !== urlQuery) {
      updateUrl({ q: debouncedSearch || null, page: 1, category: debouncedSearch ? null : category });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const load = useCallback(async () => {
    // Cancel any in-flight request before starting a new one — this is
    // the fix for "old search results must never replace new ones".
    // We also stamp each request with an id and ignore the response if
    // a newer request has since started, as a second layer of safety.
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++latestRequestId.current;

    setLoading(true);
    setError("");

    try {
      const skip = (page - 1) * pageSize;
      let data;

      if (urlQuery) {
        // Search mode: category filter is ignored while searching
        // (DummyJSON can't do both at once — see README for the note).
        data = await searchProducts({ q: urlQuery, limit: pageSize, skip, signal: controller.signal });
      } else if (category) {
        data = await fetchProductsByCategory({
          category,
          limit: pageSize,
          skip,
          sortBy,
          order,
          signal: controller.signal,
        });
      } else {
        data = await fetchProducts({ limit: pageSize, skip, sortBy, order, signal: controller.signal });
      }

      if (requestId !== latestRequestId.current) return; // a newer request has since fired

      let list = applyOverrides(data.products);

      // Client-side sort fallback for the search endpoint (its sortBy
      // support is unreliable), so "sort by title" etc still works there.
      if (urlQuery && sortBy) {
        list = [...list].sort((a, b) => {
          const av = a[sortBy];
          const bv = b[sortBy];
          const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
          return order === "desc" ? -cmp : cmp;
        });
      }

      let totalCount = data.total;

      // Show locally-created products on page 1 of the default view only
      // (not while searching/filtering, to keep the demo simple + honest).
      if (page === 1 && !urlQuery && !category) {
        const created = getCreatedProducts();
        list = [...created, ...list].slice(0, pageSize);
        totalCount += created.length;
      }

      setProducts(list);
      setTotal(totalCount);

      // Defensive: if the URL asks for a page beyond what exists
      // (?page=999), snap back to the last valid page instead of
      // rendering an empty broken state forever.
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      if (page > totalPages) {
        updateUrl({ page: totalPages });
      }
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
      if (requestId !== latestRequestId.current) return;
      setError(err.message || "Failed to load products.");
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, urlQuery, category, sortBy, order]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories(cats))
      .catch(() => setCategories([]));
  }, []);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      // Only hit the API for real products (not ones we created locally,
      // since they only exist client-side).
      if (deleteTarget.id > 0) {
        await deleteProduct(deleteTarget.id);
      }
      addDeletedProduct(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(err.message || "Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-mist-100">Products</h1>
            <p className="text-sm text-mist-400">Browse, search and manage your catalog</p>
          </div>
          <Link href="/products/new" className="btn-primary">
            + Add product
          </Link>
        </div>

        {/* Search + Filter + Sort toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            className="input sm:max-w-xs"
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <select
            className="input sm:max-w-[180px]"
            value={category}
            disabled={!!urlQuery}
            onChange={(e) => updateUrl({ category: e.target.value || null, page: 1 })}
            title={urlQuery ? "Category filter is disabled while searching" : ""}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="input sm:max-w-[160px]"
            value={sortBy}
            onChange={(e) => updateUrl({ sortBy: e.target.value || null, page: 1 })}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Sort: {o.label}
              </option>
            ))}
          </select>

          {sortBy && (
            <button
              className="btn-secondary !px-3"
              onClick={() => updateUrl({ order: order === "asc" ? "desc" : "asc" })}
              title="Toggle sort order"
            >
              {order === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          )}
        </div>

        {urlQuery && category === "" && (
          <p className="text-xs text-mist-500 mb-4">
            Category filter is disabled while a search is active — the API can&apos;t combine
            search and category filtering, so search takes priority.
          </p>
        )}

        {loading && <Loader label="Fetching products…" />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && products.length === 0 && (
          <EmptyState
            title="No products found"
            message={urlQuery ? `No results for "${urlQuery}".` : "Try a different filter."}
          />
        )}
        {!loading && !error && products.length > 0 && (
          <>
            <ProductList products={products} onDelete={setDeleteTarget} />
            <Pagination
              page={Math.min(page, totalPages)}
              pageSize={pageSize}
              total={total}
              onPageChange={(p) => updateUrl({ page: p })}
              onPageSizeChange={(size) => updateUrl({ pageSize: size, page: 1 })}
            />
          </>
        )}
      </main>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete product?"
        message={`This will remove "${deleteTarget?.title}" from the list. This can't be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        busy={deleting}
      />
    </div>
  );
}
