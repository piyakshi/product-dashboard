"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Loader, ErrorState } from "@/components/StatusStates";
import { fetchProductById } from "@/lib/api/products";
import { getLocalProductById, getEditForId, isDeletedId } from "@/lib/localOverrides";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      setNotFound(false);

      // Locally-created products (negative ids) only exist client-side.
      if (Number(id) < 0) {
        const local = getLocalProductById(id);
        if (!cancelled) {
          if (local) setProduct(local);
          else setNotFound(true);
          setLoading(false);
        }
        return;
      }

      if (isDeletedId(Number(id))) {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await fetchProductById(id);
        const edits = getEditForId(id);
        if (!cancelled) setProduct(edits ? { ...data, ...edits } : data);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 404) setNotFound(true);
        else setError(err.message || "Failed to load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => router.push("/products")}
          className="text-sm text-mist-400 hover:text-accent mb-4 inline-flex items-center gap-1"
        >
          ← Back to products
        </button>

        {loading && <Loader label="Loading product…" />}
        {!loading && error && <ErrorState message={error} onRetry={() => router.refresh()} />}

        {!loading && notFound && (
          <div className="card p-10 text-center">
            <div className="text-4xl mb-3">404</div>
            <h2 className="text-mist-100 font-semibold text-lg mb-1">Product not found</h2>
            <p className="text-mist-400 text-sm mb-5">
              We couldn&apos;t find a product with id &quot;{id}&quot;.
            </p>
            <Link href="/products" className="btn-primary">
              Back to product list
            </Link>
          </div>
        )}

        {!loading && !notFound && !error && product && (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="card overflow-hidden aspect-square relative mb-3">
                {product.images?.[activeImage] || product.thumbnail ? (
                  <Image
                    src={product.images?.[activeImage] || product.thumbnail}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-mist-500">
                    No image
                  </div>
                )}
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0 relative ${
                        i === activeImage ? "border-accent" : "border-ink-700"
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-mist-500 mb-1">
                {product.category}
              </p>
              <h1 className="text-2xl font-semibold text-mist-100 mb-2">{product.title}</h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-mono text-accent">${product.price}</span>
                <span className="text-sm text-mist-400">★ {product.rating?.toFixed?.(1) ?? product.rating}</span>
              </div>
              <p className="text-sm text-mist-300 leading-relaxed mb-6">{product.description}</p>

              <div className="flex gap-2 mb-8">
                <Link href={`/products/${id}/edit`} className="btn-primary">
                  Edit product
                </Link>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-mist-100 mb-3">
                  Reviews {product.reviews?.length ? `(${product.reviews.length})` : ""}
                </h3>
                {!product.reviews?.length && (
                  <p className="text-sm text-mist-500">No reviews yet.</p>
                )}
                <div className="space-y-3">
                  {product.reviews?.map((r, i) => (
                    <div key={i} className="card p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-mist-200 font-medium">
                          {r.reviewerName}
                        </span>
                        <span className="text-xs text-accent">★ {r.rating}</span>
                      </div>
                      <p className="text-sm text-mist-400">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
