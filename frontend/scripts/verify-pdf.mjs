#!/usr/bin/env node
/**
 * Automated test for phase2_marriage_match_report.pdf (Requirement B10).
 * Uses poppler CLI tools (pdffonts / pdftotext / pdftoppm).
 *
 * FAILS (exit 1) if:
 *  - the PDF contains "Export PDF", "New Match", "Send my chart summary" or "Compatibility";
 *  - it has fewer than 6 or more than 14 pages;
 *  - any page (except the last) has fewer than 300 characters of text.
 *
 * Also: reports page count, file size, pdffonts embedding output, extracts each
 * page's first line + character count, and rasterises every page to PNG at 80 dpi.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const OUT_ROOT =
  process.env.PDF_OUT_DIR ||
  (existsSync(path.resolve(process.cwd(), "pdf_pages"))
    ? path.resolve(process.cwd(), "pdf_pages")
    : path.resolve(process.cwd(), "..", "pdf_pages"));
const PDF = process.argv[2] || path.join(OUT_ROOT, "phase2_marriage_match_report.pdf");

if (!existsSync(PDF)) {
  console.error(`FAIL: ${PDF} not found. Run npm run pdf:generate first.`);
  process.exit(1);
}

/** Per-PDF forbidden strings and expected page-count ranges. */
const BANNED_JANMA = [
  "unverified", "traditions differ", "rule status", "rule category",
  "rule list used here", "Rule 1", "Rule 2", "Rule 1/Rule 2", "Mahadasha count",
  "Verification Log", "Known Differences", "Global unverified items",
  "Experimental", "Calculated by software, not reviewed by an astrologer",
  "verified", "Export Clean PDF", "New Chart", "Export PDF", "Compatibility"
];

const KINDS = [
  {
    match: /marriage_match_report/,
    forbidden: ["Export PDF", "New Match", "Send my chart summary", "Compatibility"],
    minPages: 6, maxPages: 14,
  },
  {
    match: /janma_person1/,
    forbidden: BANNED_JANMA,
    minPages: 3, maxPages: 4,
  },
  {
    match: /janma_person2/,
    forbidden: BANNED_JANMA,
    minPages: 3, maxPages: 4,
  },
  {
    match: /kannada_print_sample/,
    forbidden: ["Print theme", "Export PDF", "Compatibility"],
    minPages: 1, maxPages: 3,
  },
  {
    match: /janma_person1_colour/,
    forbidden: BANNED_JANMA,
    minPages: 9, maxPages: 11,
  },
  {
    match: /janma_person2_colour/,
    forbidden: BANNED_JANMA,
    minPages: 9, maxPages: 11,
  },
];
const kind = KINDS.find((k) => k.match.test(PDF)) || {
  forbidden: ["Export PDF", "New Match", "Send my chart summary", "Compatibility", "Export Clean PDF", "New Chart"],
  minPages: 4, maxPages: 14,
};
const FORBIDDEN = kind.forbidden;
const MIN_PAGES = kind.minPages;
const MAX_PAGES = kind.maxPages;
const MIN_CHARS_NON_LAST = 300;

function run(cmd, args) {
  return execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

const failures = [];
const info = [];

// ---------- page count ----------
const infoTxt = run("pdfinfo", [PDF]);
const pageCount = parseInt((infoTxt.match(/^Pages:\s+(\d+)/m) || [])[1], 10);
info.push(`Pages: ${pageCount}`);
if (pageCount < MIN_PAGES || pageCount > MAX_PAGES) {
  failures.push(`Page count ${pageCount} outside allowed range ${MIN_PAGES}–${MAX_PAGES}`);
}

// ---------- file size ----------
const sizeBytes = statSync(PDF).size;
info.push(`File size: ${(sizeBytes / 1024).toFixed(1)} KB (${sizeBytes} bytes)`);

// ---------- fonts ----------
const fonts = run("pdffonts", [PDF]);
info.push("pdffonts (all fonts must show 'yes' in the 'emb' column):");
for (const line of fonts.split("\n")) if (line.trim()) info.push("  " + line);

// ---------- text per page ----------
const perPage = [];
for (let p = 1; p <= pageCount; p++) {
  const txt = run("pdftotext", ["-f", String(p), "-l", String(p), "-enc", "UTF-8", PDF, "-"]).trim();
  const firstLine = (txt.split("\n").find((l) => l.trim()) || "").trim();
  perPage.push({ page: p, chars: txt.length, firstLine });
}
info.push("Per-page text (first line | character count):");
for (const s of perPage) info.push(`  p${s.page}: ${s.chars} chars | "${s.firstLine.slice(0, 78)}"`);

for (const s of perPage.slice(0, -1)) {
  if (s.chars < MIN_CHARS_NON_LAST) {
    failures.push(`Page ${s.page} has only ${s.chars} characters (< ${MIN_CHARS_NON_LAST})`);
  }
}

// ---------- forbidden strings ----------
const fullText = run("pdftotext", ["-enc", "UTF-8", PDF, "-"]);
for (const s of FORBIDDEN) {
  if (fullText.includes(s)) failures.push(`PDF contains forbidden string: "${s}"`);
}

// ---------- rasterise every page (proof images) ----------
const imgDir = path.join(OUT_ROOT, "page-images");
mkdirSync(imgDir, { recursive: true });
for (const f of readdirSync(imgDir)) rmSync(path.join(imgDir, f));
run("pdftoppm", ["-r", "80", "-png", PDF, path.join(imgDir, "page")]);
const pngs = readdirSync(imgDir).filter((f) => f.endsWith(".png")).sort();
info.push(`Rasterised ${pngs.length} page image(s) to ${imgDir}: ${pngs.join(", ")}`);

// ---------- report ----------
const report = { ok: failures.length === 0, pageCount, sizeBytes, perPage, failures, images: pngs.map((f) => path.join(imgDir, f)) };
const reportPath = path.join(OUT_ROOT, "verify_report.json");
writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log("=".repeat(72));
console.log(info.join("\n"));
console.log("=".repeat(72));
if (failures.length) {
  console.log("PDF VERIFICATION: FAIL");
  for (const f of failures) console.log("  ✗ " + f);
  writeFileSync(reportPath, JSON.stringify({ ...report, info }, null, 2));
  process.exit(1);
}
console.log(`PDF VERIFICATION: PASS — ${pageCount} pages, forbidden strings absent, no sparse pages.`);
console.log(`Report written to ${reportPath}`);
process.exit(0);
