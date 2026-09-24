"use client";

import Image from "next/image";
import Link from "next/link";

function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <span className="text-accent">★</span>
      <span className="text-mist-300">{rating?.toFixed(1)}</span>
    </span>
  );
}

function StockBadge({ stock }) {
  const low = stock <= 5;
  const out = stock === 0;
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-mono ${
        out
          ? "bg-danger/10 text-danger border border-danger/30"
          : low
          ? "bg-warn/10 text-warn border border-warn/30"
          : "bg-accent/10 text-accent-dim border border-accent/20"
      }`}
    >
      {out ? "out of stock" : `${stock} in stock`}
    </span>
  );
}

export default function ProductList({ products, onDelete }) {
  return (
    <>
      {/* ---- Desktop table ---- */}
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-700 text-left text-mist-400 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-ink-800 last:border-0 hover:bg-ink-800/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link href={`/products/${p.id}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-ink-900 border border-ink-700 overflow-hidden flex-shrink-0 relative">
                      {p.thumbnail && (
                        <Image
                          src={p.thumbnail}
                          alt={p.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="text-mist-100 group-hover:text-accent transition-colors line-clamp-1">
                      {p.title}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-mist-400 capitalize">{p.category}</td>
                <td className="px-4 py-3 text-mist-100 font-mono">${p.price}</td>
                <td className="px-4 py-3">
                  <Stars rating={p.rating} />
                </td>
                <td className="px-4 py-3">
                  <StockBadge stock={p.stock} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/products/${p.id}/edit`}
                      className="btn-secondary !py-1 !px-2.5 text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(p)}
                      className="btn-danger !py-1 !px-2.5 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- Mobile cards ---- */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products.map((p) => (
          <div key={p.id} className="card p-3">
            <Link href={`/products/${p.id}`} className="flex gap-3">
              <div className="w-16 h-16 rounded-lg bg-ink-900 border border-ink-700 overflow-hidden flex-shrink-0 relative">
                {p.thumbnail && (
                  <Image src={p.thumbnail} alt={p.title} fill sizes="64px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-mist-100 text-sm font-medium line-clamp-1">{p.title}</p>
                <p className="text-mist-400 text-xs capitalize">{p.category}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-mist-100 font-mono text-sm">${p.price}</span>
                  <Stars rating={p.rating} />
                </div>
              </div>
            </Link>
            <div className="flex items-center justify-between mt-3">
              <StockBadge stock={p.stock} />
              <div className="flex items-center gap-2">
                <Link href={`/products/${p.id}/edit`} className="btn-secondary !py-1 !px-2.5 text-xs">
                  Edit
                </Link>
                <button onClick={() => onDelete(p)} className="btn-danger !py-1 !px-2.5 text-xs">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
