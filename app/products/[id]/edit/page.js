"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProductForm from "@/components/ProductForm";
import { Loader, ErrorState } from "@/components/StatusStates";
import { fetchProductById, updateProduct } from "@/lib/api/products";
import { addEditedProduct, getLocalProductById, getEditForId } from "@/lib/localOverrides";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (Number(id) < 0) {
          const local = getLocalProductById(id);
          setProduct(local);
        } else {
          const data = await fetchProductById(id);
          const edits = getEditForId(id);
          setProduct(edits ? { ...data, ...edits } : data);
        }
      } catch (err) {
        setError(err.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleUpdate(values) {
    if (Number(id) > 0) {
      // Real product: hit the API (it responds success, doesn't persist)
      await updateProduct(id, values);
    }
    // Save the change locally so the UI reflects it — real products get
    // an "edit overlay", locally-created ones just get overwritten.
    addEditedProduct(id, values);
    router.push(`/products/${id}`);
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-mist-100 mb-1">Edit product</h1>
        <p className="text-sm text-mist-400 mb-6">
          Changes are applied locally on top of the API response, since DummyJSON doesn&apos;t
          persist edits either.
        </p>
        {loading && <Loader />}
        {!loading && error && <ErrorState message={error} onRetry={() => router.refresh()} />}
        {!loading && !error && product && (
          <ProductForm initial={product} onSubmit={handleUpdate} submitLabel="Save changes" />
        )}
      </main>
    </div>
  );
}
