/* Mobile layout audit: finds horizontal overflow and cramped grids at phone sizes. */
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3199";
const VIEWPORTS = [
  { name: "iPhone SE 360x640", w: 360, h: 640 },
  { name: "iPhone 13 390x844", w: 390, h: 844 },
  { name: "Small tablet 600x900", w: 600, h: 900 },
];

const pages = ["/", "/print/janma", "/print/match"];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  for (const path of pages) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    // Dismiss the consent modal if present
    const consent = page.getByText(/I Understand & Consent/i).first();
    if (await consent.isVisible().catch(() => false)) {
      await consent.click();
      await page.waitForTimeout(800);
    }
    await page.waitForTimeout(800);
    const report = await page.evaluate(() => {
      const doc = document.documentElement;
      const overflowX = doc.scrollWidth - window.innerWidth;
      const bad = [];
      if (overflowX > 1) {
        for (const el of document.querySelectorAll("*")) {
          const r = el.getBoundingClientRect();
          if (r.right > window.innerWidth + 1 && r.width > 40) {
            bad.push({
              tag: el.tagName.toLowerCase(),
              cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : String(el.className || "")).slice(0, 110),
              right: Math.round(r.right),
              w: Math.round(r.width),
            });
            if (bad.length >= 15) break;
          }
        }
      }
      return { overflowX, innerW: window.innerWidth, scrollW: doc.scrollWidth, bad };
    });
    console.log(`\n=== ${vp.name} — ${path} — overflowX=${report.overflowX}px (innerW ${report.innerW}, scrollW ${report.scrollW})`);
    if (report.bad.length) {
      console.log(JSON.stringify(report.bad, null, 1));
    }
    const shot = `mobile-${vp.name.split(" ")[0].toLowerCase()}-${path === "/" ? "home" : "print" + path.replace("/print/", "").replace(/\//g, "")}.png`;
    await page.screenshot({ path: `../mobile-audit/${shot}`, fullPage: false });
  }
  await ctx.close();
}
await browser.close();
console.log("\nDONE");
