# SurePay

**Safe Local E-Commerce & Escrow**

SurePay is a mobile-first escrow and delivery-tracking prototype inspired by the exported Google Stitch screens in this repository. It brings the dashboard, deal creation, and live tracker into one React app.

## Run locally

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env` and set `GEMINI_API_KEY` to enable real receipt image extraction with Gemini 2.5 Flash. Without a key, the API responds in an explicitly labeled demo mode; it does not analyze the image.

```sh
npm run lint
npm run build
npm run preview
```

## Demo behavior

Deals and the demo wallet are saved in the current browser's local storage. Creating a deal deducts the price and 2% protection fee from the displayed demo balance. Confirming a delivered deal releases its escrow in the demo ledger and increases the trust score. This app does not connect to MTN MoMo, Orange Money, a bank, or a real escrow custodian; no real funds are collected or transferred.

## Deploy to Vercel

Import the repository into Vercel. The Vite build and SPA fallback are configured in `vercel.json`; `api/verify-receipt.js` is deployed as a serverless function. Add `GEMINI_API_KEY` in the Vercel project's environment variables to enable Gemini verification. Do not commit `.env`.

The PWA manifest, install icon, and service worker provide a home-screen app shell. Receipt verification requests are never cached by the service worker.

## Routes

- `/` — dashboard and active deals
- `/create` — new escrow deal
- `/tracker/:id` — live deal timeline and dispatch receipt verification
- `/api/verify-receipt` — receipt image verification endpoint (POST)
