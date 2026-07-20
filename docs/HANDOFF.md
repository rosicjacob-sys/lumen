# NOCTA (v3) — project handoff

Research-peptides (v3); a glowing double-helix DNA ribbon self-sequences top-down in a deep-sea dark scene.

- **Live preview port:** `:8605`  (host `https://andreidutescus-macbook-pro.tailb4cf4e.ts.net:8605`; needs Tailscale + passcode — ask the owner)
- **Stack:** Vite + React 18 + Three.js + GSAP + Lenis. Plain JS (JSX), hand-written CSS. No TypeScript, no Tailwind.
- **Signature animation:** src/three/NoctaHelix.jsx + NoctaPowder.jsx + AtelierStage.jsx; store: src/three/vialStore.js
- **Commerce:** Mock cart present: src/lib/cart.jsx + components/StickyCart.jsx.

## Run it
```bash
npm ci        # exact locked install (first time)
npm run dev   # dev server with hot reload
npm run build # static production build into ./dist
npm run preview
```

## Structure
`index.html` → `src/main.jsx` → `src/App.jsx` (composes the sections) → `src/components/*` (DOM sections) + `src/three/*` (WebGL scene) + `src/lib/*` (scroll, cart, data, helpers). One persistent `<canvas>` is fixed behind the content; a global GSAP ScrollTrigger drives the page.

## Before it goes live on Shopify
Read the master guide one level up: **`../../README.md`** — Section 4 (three integration paths) and **Section 5 (replace the mock commerce with Shopify)**. The prices/products in `src/lib/data.js` are **placeholders**.

## QA hooks (dev)
Append `?rm=1` to force reduced-motion, `?nogl=1` to force the non-WebGL fallback.
