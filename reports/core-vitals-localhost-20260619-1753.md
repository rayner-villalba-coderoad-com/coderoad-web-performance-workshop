# 🔴 Core Web Vitals Report: Developer Stickers Online (localhost)

**Test Conditions:**
- Network: Slow 4G throttling (1.6 Mbps download, 750 kbps upload)
- URL: http://localhost:3000/
- Test Date: 2026-06-19 17:53:00 EST / 21:53:00 UTC

---

## Core Web Vitals Scores

### 1. LCP (Largest Contentful Paint): > 25,000ms (Timeout) 🔴

**Status:** Poor (Target: < 2,500ms for "Good")

**LCP Element:** Hero banner image (`img.desktop` rendering `hero-desktop.png`)

**Breakdown (Estimated / Lab):**
- **TTFB (Time to First Byte):** ~250ms (Server response is fast locally)
- **Load Delay:** ~600ms (Time before the browser discovers the image in HTML)
- **Load Duration:** > 20,000ms 🔴 (Actual download time under Slow 4G)
- **Render Delay:** ~500ms (Time to decode and render the image)

**Key Issues:**
- **Massive Hero Image Size:** The desktop hero image (`hero-desktop.png`) is **3.88 MB** uncompressed. Under a standard Slow 4G connection, downloading this single image takes at least **19.4 seconds**.
- **Bandwidth Contention:** The page is downloading over **12 MB** of unoptimized png images (e.g., `callout-1.png` at 1.5MB, `callout-2.png` at 1.4MB, `callout-3.png` at 1.3MB, etc.), which compete for network bandwidth and delay the LCP image.
- **No Preloading or Fetchpriority:** The browser is not instructed to prioritize the hero image, causing further queuing delay.

---

### 2. CLS (Cumulative Layout Shift): 0.09 ⚠️

**Status:** Needs Improvement (Target: < 0.1 for "Good")

**Major Shifts:**
1. **Promo Banner Expansion (dynamic injection):** When `promo.js` loads, it fetches products and dynamically appends cards inside `#promo-banner`. It then adds the `.expand` class via `setTimeout` after 2 seconds, which transitions the height of the banner from `0px` to up to `1000px`. This pushes all featured products and hero contents downwards.
2. **Featured Product Image Load:** Product images (like `fast-sloth-sticker.png` and others) do not have explicit width and height attributes in the HTML. As they download and render, the document layout reflows.

**Key Issues:**
- Dynamic content is injected at the top of the viewport without reserving space.
- Product images are missing explicit dimensions.

---

### 3. INP (Interaction to Next Paint): 200ms 🔴

**Tested Interaction:** "Add to Cart" button click (Fast Sloth Sticker)

**Status:** Poor (Target: < 200ms for "Good")

**Key Issues:**
- **Synchronous CPU Blocking:** When the "Add to Cart" button is clicked, the page runs `updateAnalytics()` inside `scripts.js`. This function runs a synchronous loop that creates **200,001 `div` elements** and appends them to a phantom element:
  ```javascript
  for (var i = 0; i <= 200_000; i++) {
    let child = document.createElement("div");
    child.textContent = i;
    phantomEl.appendChild(child);
  }
  ```
  This creates a synchronous long task of **132ms** which blocks the main thread, resulting in a recorded `pointerdown` duration of **200ms**.
- **No Immediate Visual Feedback:** The button does not disable or change state immediately upon click; instead, the UI waits for the blocking loop and the synchronous sequential API calls to finish.

---

## Additional Performance Insights

### Render-Blocking Resources
- **Synchronous JS in `<head>`:**
  - `/assets/js/scripts.js` (blocks parsing and initial render)
  - `/assets/js/promo.js` (blocks parsing and initial render)
- **Large Stylesheet:** `/assets/css/styles.css` is loaded synchronously without compression.

### Sequential API Waterfall
- The site fetches data sequentially in `getDataRESTfully()`:
  1. `fetch('/api/users/...')`
  2. `fetch('/api/users/.../cart')` and `fetch('/api/products')` in parallel.
  This delays rendering the dynamic content.

### Artificially Bloated HTML
- The `index.html` file contains over **700 lines of commented-out legacy HTML** (lines 190–924), increasing the document size unnecessarily.

---

## Critical Problems Summary

1. **Massive Asset File Sizes (LCP >25s):** 3.88MB desktop hero image and 12MB total image payload completely saturate the bandwidth on Slow 4G.
2. **Dynamic UI Expansion (CLS 0.09):** The promo banner dynamically expands after load, pushing the layout down.
3. **Synchronous Analytics Loop (INP 200ms):** Clicking "Add to Cart" triggers a massive, unnecessary DOM-generation loop that blocks the thread.

---

## Optimization Opportunities

### High Impact:
- **Compress and Convert Images:** 
  - Compress `hero-desktop.png` and convert to WebP or AVIF (reducing size from 3.88MB to < 150KB).
  - Convert other featured images and callouts to WebP/AVIF (saving ~11MB of transfer size).
- **Add Fetch Priority:** Add `fetchpriority="high"` and `<link rel="preload">` to the desktop hero image.
- **De-block Button Interactivity (INP Fix):**
  - Remove or optimize the synchronous loop in `updateAnalytics()`. If needed for tracking, defer it using `requestIdleCallback` or `setTimeout`.
  - Provide instant visual feedback (e.g., disable button, show "Adding...") immediately upon user click using `requestAnimationFrame`.
- **Set Image Dimensions:** Add explicit `width` and `height` attributes to all `<img>` tags to eliminate layout shifts when images load.

### Medium Impact:
- **Defer Head Scripts:** Add the `defer` or `async` attribute to `scripts.js` and `promo.js` in `<head>`.
- **Reserve Promo Banner Space:** Set a fixed or minimum height on `#promo-banner` to prevent layout shifts when the content loads and expands.
- **Clean legacy code:** Remove the massive commented-out block of HTML from the end of `index.html`.
- **API bundling:** Combine user, cart, and product endpoints into a single payload to eliminate sequential request delays.

---

**Report generated:** 2026-06-19 17:53:00 Local Time
