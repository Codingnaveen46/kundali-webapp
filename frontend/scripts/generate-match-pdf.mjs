/**
 * Generates Marriage Matching and Janma Kundali PDFs from the dedicated print routes
 * (/print/match and /print/janma) using Playwright's page.pdf.
 * Text stays vector/selectable/searchable; printBackground: true; preferCSSPageSize: true.
 * All pages use internal .pc-phead and .pc-pfoot templates with displayHeaderFooter: false.
 *
 * Prerequisites: backend on :8000, frontend on :3000 (npm run dev).
 * Usage: node scripts/generate-match-pdf.mjs
 */
import { chromium } from "@playwright/test";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const OUT_ROOT = process.env.PDF_OUT_DIR || (process.cwd().endsWith("frontend") ? path.resolve(process.cwd(), "..", "pdf_pages") : path.resolve(process.cwd(), "pdf_pages"));

mkdirSync(OUT_ROOT, { recursive: true });

const browser = await chromium.launch();
try {
  const errors = [];

  // Helper for printing Marriage Match PDF
  async function printMatch(outPath, lang = "en", theme = "colour", chartStyle = "south") {
    const page = await browser.newPage();
    const pErrors = [];
    page.on("pageerror", (e) => pErrors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") pErrors.push(`console.error: ${m.text()}`);
    });

    const themeQ = theme === "colour" ? "&theme=colour" : "&theme=bw";
    const chartQ = chartStyle === "north" ? "&chart=north" : "";
    await page.goto(`${BASE_URL}/print/match?gen=1&lang=${lang}${themeQ}${chartQ}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForSelector("table", { timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    const docTitle = await page.title();
    console.log(`[pdf] match (${lang}, ${theme}) document.title:`, docTitle);

    await page.pdf({
      path: outPath,
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });
    await page.close();
    console.log("[pdf] wrote", outPath);
    return pErrors;
  }

  // 1. Marriage Matching PDFs (Colour only, English & Kannada)
  errors.push(...(await printMatch(path.join(OUT_ROOT, "phase2_marriage_match_report.pdf"), "en", "colour", "south")));
  errors.push(...(await printMatch(path.join(OUT_ROOT, "phase2_marriage_match_report_kn.pdf"), "kn", "colour", "south")));

  // ---------- Janma Kundali PDFs (Phase 4 chapter layout, Colour only) ----------
  async function printJanma(person, outPath, lang = "en", chartStyle = "south") {
    const jp = await browser.newPage();
    const jErrors = [];
    jp.on("pageerror", (e) => jErrors.push(`pageerror: ${e.message}`));
    jp.on("console", (m) => { if (m.type() === "error") jErrors.push(`console.error: ${m.text()}`); });
    const chartQ = chartStyle === "north" ? "&chart=north" : "";
    await jp.goto(`${BASE_URL}/print/janma?gen=1&lang=${lang}&person=${encodeURIComponent(person)}&theme=colour${chartQ}`, { waitUntil: "networkidle", timeout: 60000 });
    await jp.waitForSelector("table", { timeout: 30000 });
    await jp.waitForFunction(
      () => !!document.querySelector("h1")?.textContent?.trim(),
      null,
      { timeout: 30000 }
    );
    await jp.evaluate(() => document.fonts.ready);
    await jp.waitForTimeout(500);
    await jp.pdf({
      path: outPath,
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });
    await jp.close();
    console.log("[pdf] wrote", outPath);
    return jErrors;
  }

  // Generate Janma Kundali PDFs: Sample Person 1 and Sample Person 2, EN & KN (Colour only)
  const janmaErrs = [
    // Sample Person 1
    ...(await printJanma("Sample Person 1", path.join(OUT_ROOT, "phase3_janma_person1.pdf"), "en")),
    ...(await printJanma("Sample Person 1", path.join(OUT_ROOT, "phase3_janma_person1_kn.pdf"), "kn")),
    // Sample Person 2
    ...(await printJanma("Sample Person 2", path.join(OUT_ROOT, "phase3_janma_person2.pdf"), "en")),
    ...(await printJanma("Sample Person 2", path.join(OUT_ROOT, "phase3_janma_person2_kn.pdf"), "kn")),
  ];
  errors.push(...janmaErrs);

  writeFileSync(path.join(OUT_ROOT, "generate_report.json"), JSON.stringify({ consoleErrors: errors }, null, 2));
  if (errors.length) console.log("[pdf] console errors detected:", errors);
  else console.log("[pdf] no console errors");
} finally {
  await browser.close();
}
