# Product Admin Dashboard

A small admin dashboard to log in and manage products, built with Next.js (App Router), Tailwind CSS and Axios, using the [DummyJSON](https://dummyjson.com) API.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`.

**Demo credentials:** `emilys` / `emilyspass`

## Deploying

Push to GitHub, then import the repo into [Vercel](https://vercel.com/new) — no environment variables are needed, it builds with default settings (`next build`).

## What's finished

- [x] Login with DummyJSON `/auth/login`, error message on wrong credentials, logout button
- [x] Route protection via `middleware.js` (server-side, not just a client redirect)
- [x] Product list — table on desktop, cards on mobile
- [x] Pagination — page numbers, Prev/Next, page size (10/20/50), "Showing X–Y of Z"
- [x] Debounced search (`/products/search`), resets to page 1 on change, cancels stale requests
- [x] Category filter (`/products/categories`) + sort by price/rating/title
- [x] Product details page `/products/[id]` with image gallery, description, reviews
- [x] "Not found" page for a bad product id
- [x] Add/Edit form with validation, Delete with confirm modal
- [x] Loading, empty, and error+Retry states everywhere data is fetched
- [x] One shared Axios instance (`lib/api/axios.js`) — attaches token, centralizes error handling
- [x] URL-synced state — page, search, category, sort, page size all survive a refresh or shared link
- [x] Defensive URL parsing — `?page=abc` or `?page=999` doesn't break the page
- [x] Guards against duplicate requests: cancelled in-flight fetches (race-safe search), disabled buttons while a login/save request is in flight

## Project structure

```
app/
  login/page.js              → login form
  products/page.js           → list + search/filter/sort/pagination
  products/[id]/page.js      → product details
  products/[id]/edit/page.js → edit form
  products/new/page.js       → add form
  layout.js, globals.css     → root layout, theme
lib/
  api/axios.js       → the one shared Axios instance (token + error interceptors)
  api/auth.js        → login request
  api/products.js    → all product endpoints
  localOverrides.js  → local overlay for add/edit/delete (see note below)
  auth-cookies.js    → cookie helpers for the token
context/AuthContext.js → auth state, used by login page, navbar, middleware guard
components/            → Navbar, Pagination, ProductList, ProductForm, ConfirmModal, StatusStates
middleware.js          → server-side route protection
```

## Notes on some deliberate choices

**Search vs. category filter.** DummyJSON's `/products/search` endpoint can't also filter by category, so this app makes search take priority: starting a search clears any active category filter, and the category dropdown is disabled while a search is active (with a small note explaining why). This felt more predictable than silently ignoring one of the two.

**Add/Edit/Delete don't really persist on the API.** DummyJSON returns a success response for these but never actually changes its data — a refetch always returns the original list. To make the app usable/demoable, `lib/localOverrides.js` keeps a small overlay in `localStorage`: created products are prepended to the list, edits are merged on top of whatever the API returns, and deletes are filtered out. The real API call still happens first (so the network request is genuine), and this is just a client-side illusion layer on top — documented here rather than hidden.

**Token storage.** The auth token is stored in a cookie rather than `localStorage`, specifically so `middleware.js` (which runs server-side) can read it and block access to `/products/*` before the page even renders, instead of flashing protected content and redirecting after the fact.

**One problem I ran into:** the search box firing a new request on every keystroke, and — because network responses don't always come back in the order they were sent — an old response could overwrite a newer one (test this by adding `&delay=2000` to the API base URL in `lib/api/axios.js` temporarily). Fixed with a debounce on the input (450ms) plus an `AbortController` that cancels the previous in-flight request whenever a new one starts, with a request-id check as a second safety net in case an aborted request's `.then` still fires.

## Where AI helped

This project was scaffolded and written with AI assistance (Claude). I can walk through and explain every file — the architecture (shared Axios instance, URL-as-state-source, the local overlay for fake persistence, middleware-based auth) reflects decisions I made about how to satisfy the assignment's specific rules, not just default boilerplate.
