import api from "@/lib/api/axios";

// All product-related network calls live here. Nothing in the UI
// calls axios/api directly — components import these functions.

export async function fetchProducts({ limit, skip, sortBy, order, signal }) {
  const params = { limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || "asc";
  }
  const res = await api.get("/products", { params, signal });
  return res.data; // { products, total, skip, limit }
}

export async function fetchProductsByCategory({ category, limit, skip, sortBy, order, signal }) {
  const params = { limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || "asc";
  }
  const res = await api.get(`/products/category/${encodeURIComponent(category)}`, {
    params,
    signal,
  });
  return res.data;
}

export async function searchProducts({ q, limit, skip, signal }) {
  const res = await api.get("/products/search", {
    params: { q, limit, skip },
    signal,
  });
  return res.data;
}

export async function fetchCategories(signal) {
  const res = await api.get("/products/categories", { signal });
  // DummyJSON returns an array of { slug, name, url }
  return res.data;
}

export async function fetchProductById(id, signal) {
  const res = await api.get(`/products/${id}`, { signal });
  return res.data;
}

export async function createProduct(payload) {
  const res = await api.post("/products/add", payload);
  return res.data;
}

export async function updateProduct(id, payload) {
  const res = await api.put(`/products/${id}`, payload);
  return res.data;
}

export async function deleteProduct(id) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}
