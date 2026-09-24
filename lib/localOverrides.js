// DummyJSON's add/edit/delete endpoints respond with a "success" payload
// but never actually change their database — refetching always returns
// the original data. So we keep a small local overlay in localStorage
// and merge it over whatever the API returns. This means:
//   - created products appear in the list (with negative fake IDs)
//   - edited products show the new values
//   - deleted products disappear
// even though the server itself didn't change. This is explained in the
// README as a deliberate, documented workaround.

const KEY = "pad_overrides_v1";

function read() {
  if (typeof window === "undefined") return { created: [], edited: {}, deleted: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { created: [], edited: {}, deleted: [] };
  } catch {
    return { created: [], edited: {}, deleted: [] };
  }
}

function write(data) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

let fakeIdCounter = -1;

export function addCreatedProduct(product) {
  const data = read();
  const withId = { ...product, id: fakeIdCounter--, __local: true };
  data.created.unshift(withId);
  write(data);
  return withId;
}

export function addEditedProduct(id, fields) {
  const data = read();
  data.edited[id] = { ...(data.edited[id] || {}), ...fields };
  write(data);
}

export function addDeletedProduct(id) {
  const data = read();
  if (!data.deleted.includes(id)) data.deleted.push(id);
  write(data);
}

// Merge a page of server products with local overlay: apply edits,
// drop deleted ones. (Created items are shown separately on page 1 of
// an unfiltered/unsearched view — see products page for how it's used.)
export function applyOverrides(products) {
  const data = read();
  return products
    .filter((p) => !data.deleted.includes(p.id))
    .map((p) => (data.edited[p.id] ? { ...p, ...data.edited[p.id] } : p));
}

export function getCreatedProducts() {
  const data = read();
  return data.created;
}

export function getLocalProductById(id) {
  const data = read();
  const created = data.created.find((p) => String(p.id) === String(id));
  return created || null;
}

export function getEditForId(id) {
  const data = read();
  return data.edited[id] || null;
}

export function isDeletedId(id) {
  const data = read();
  return data.deleted.includes(Number(id));
}
