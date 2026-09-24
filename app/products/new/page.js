"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProductForm from "@/components/ProductForm";
import { createProduct } from "@/lib/api/products";
import { addCreatedProduct } from "@/lib/localOverrides";

export default function NewProductPage() {
  const router = useRouter();

  async function handleCreate(values) {
    // We still call the real API (so the network request genuinely
    // happens, per the assignment), but since DummyJSON doesn't persist
    // it, we ALSO save it into our local overlay so it shows up in the
    // list — see lib/localOverrides.js for why.
    const apiResult = await createProduct(values);
    addCreatedProduct({ ...values, thumbnail: values.thumbnail || apiResult.thumbnail, images: [] });
    router.push("/products");
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-mist-100 mb-1">Add product</h1>
        <p className="text-sm text-mist-400 mb-6">
          Note: the DummyJSON API doesn&apos;t actually persist new products — this app
          simulates it locally so it appears in your list. See README for details.
        </p>
        <ProductForm onSubmit={handleCreate} submitLabel="Create product" />
      </main>
    </div>
  );
}
