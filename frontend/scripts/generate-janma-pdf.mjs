/**
 * Dedicated PDF generator for Janma Kundali Reports (English + Kannada).
 * Uses Playwright page.pdf with displayHeaderFooter: false and preferCSSPageSize: true.
 */
import { chromium } from "@playwright/test";
import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const OUT_ROOT = process.env.PDF_OUT_DIR || (process.cwd().endsWith("frontend") ? path.resolve(process.cwd(), "..", "pdf_pages") : path.resolve(process.cwd(), "pdf_pages"));

mkdirSync(OUT_ROOT, { recursive: true });

const browser = await chromium.launch();
try {
  async function printJanma(person, outPath, theme = "colour", lang = "en", chartStyle = "south") {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`console.error: ${m.text()}`);
    });

    const themeQ = theme === "bw" ? "&theme=bw" : "&theme=colour";
    const chartQ = chartStyle === "north" ? "&chart=north" : "";
    const targetUrl = `${BASE_URL}/print/janma?gen=1&lang=${lang}&person=${encodeURIComponent(person)}${themeQ}${chartQ}`;
    
    console.log(`[pdf] navigating to ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForSelector("table", { timeout: 30000 });
    await page.waitForFunction(
      (n) => (document.querySelector("h1")?.textContent || "").includes(n) || (document.body.innerText || "").includes(n),
      person,
      { timeout: 30000 }
    );

    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    await page.pdf({
      path: outPath,
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });

    await page.close();
    console.log(`[pdf] successfully wrote ${outPath}`);
    if (errors.length) console.warn(`[pdf] warnings for ${person}:`, errors);
  }

  await printJanma("Sample Person 1", path.join(OUT_ROOT, "phase3_janma_person1.pdf"), "colour", "en");
  await printJanma("Sample Person 2", path.join(OUT_ROOT, "phase3_janma_person2.pdf"), "colour", "en");

  await printJanma("Sample Person 1", path.join(OUT_ROOT, "phase3_janma_person1_kn.pdf"), "colour", "kn");
  await printJanma("Sample Person 2", path.join(OUT_ROOT, "phase3_janma_person2_kn.pdf"), "colour", "kn");

  console.log("[pdf] All Janma Kundali PDFs (English + Kannada) generated successfully.");
} finally {
  await browser.close();
}
