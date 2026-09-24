"use client";

import { useState } from "react";

const CATEGORY_OPTIONS = [
  "smartphones", "laptops", "fragrances", "skincare", "groceries",
  "home-decoration", "furniture", "tops", "womens-dresses", "mens-shirts",
];

function validate(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = "Title is required.";
  if (!values.category) errors.category = "Pick a category.";
  if (values.price === "" || Number(values.price) <= 0)
    errors.price = "Price must be greater than 0.";
  if (values.stock === "" || Number(values.stock) < 0)
    errors.stock = "Stock can't be negative.";
  if (!values.description.trim() || values.description.trim().length < 10)
    errors.description = "Description should be at least 10 characters.";
  return errors;
}

export default function ProductForm({ initial, onSubmit, submitLabel = "Save" }) {
  const [values, setValues] = useState({
    title: initial?.title || "",
    category: initial?.category || "",
    price: initial?.price ?? "",
    stock: initial?.stock ?? "",
    description: initial?.description || "",
    thumbnail: initial?.thumbnail || "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Prevent double-submit on rapid Save clicks.
    if (submitting) return;

    const v = validate(values);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    setFormError("");
    try {
      await onSubmit({
        ...values,
        price: Number(values.price),
        stock: Number(values.stock),
      });
    } catch (err) {
      setFormError(err.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-xl">
      {formError && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-3 py-2">
          {formError}
        </div>
      )}

      <div>
        <label className="label">Title</label>
        <input
          className="input"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
        />
        {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Category</label>
          <select
            className="input"
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">Select…</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="label">Price ($)</label>
          <input
            type="number"
            step="0.01"
            className="input"
            value={values.price}
            onChange={(e) => set("price", e.target.value)}
          />
          {errors.price && <p className="text-xs text-danger mt-1">{errors.price}</p>}
        </div>
      </div>

      <div>
        <label className="label">Stock</label>
        <input
          type="number"
          className="input"
          value={values.stock}
          onChange={(e) => set("stock", e.target.value)}
        />
        {errors.stock && <p className="text-xs text-danger mt-1">{errors.stock}</p>}
      </div>

      <div>
        <label className="label">Thumbnail URL (optional)</label>
        <input
          className="input"
          value={values.thumbnail}
          onChange={(e) => set("thumbnail", e.target.value)}
          placeholder="https://…"
        />
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          className="input min-h-[100px] resize-y"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
        {errors.description && <p className="text-xs text-danger mt-1">{errors.description}</p>}
      </div>

      <button type="submit" className="btn-primary w-full" disabled={submitting}>
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
