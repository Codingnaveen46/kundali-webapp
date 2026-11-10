# Changelog

All notable changes to the Kundli calculation engine and report system are documented here.

## [1.1.0] - 2026-11-08

### Phase 2 (display-only, 2026-11-09) — no calculation changes

- **Score Display (A1)**: Hero and summary now show the raw score as "25.0 / 36" with the alternate "24.0 / 36 (school difference; unverified)". Any percentage is labelled "score as a percentage"; the bare "69.4% Compatibility" display is removed.
- **D9 Navamsa Column (A2)**: Both planetary tables now carry the D9 (Navamsa) sign, taken from each chart's own Navamsa data.
- **Paryaya Wording (A3)**: Removed the "- Paryaya exempt" label suffix from Tara display strings. The Tara count, exemption rule and all scores are unchanged.
- **Verification Log (A4)**: Verification entries restructured and shown in Section 9.
- **Section 10 Rename (A5)**: Now "Questions to discuss with an expert, if you choose to"; the "matches standard ephemeris tables within 10 arcseconds" claim is replaced with "see the verification log"; names capitalised.
- **Plain Flags (A6)**: Combust, vargottama and classical dignity labels (Own Sign / Exalted / Debilitated) added to the planet tables (Rahu/Ketu excluded from dignity: classification of nodes varies by school). Appendix notes "combustion (Asta) orbs vary by school". No interpretation attached.
- **Dedicated Print Routes (B)**: New `/print/match`, `/print/janma` and Kannada shaping test route `/print/sample`. PDF is produced via browser print / Playwright `page.pdf` only — html2canvas and jsPDF removed from the project. Text is selectable/searchable (vector). A4 portrait, 15 mm margins, white background, black text, light grey table headers only, local Noto Sans + Noto Sans Kannada font files (no internet fonts at print time), body ≥ 10 pt, tables ≥ 9 pt, nothing < 8 pt.
- **Print Page Structure**: Running header (names + report title) and footer (Page X of Y, methodology v1.1.0, Generated 9 Nov 2026, "Calculated by software, not reviewed by an astrologer. Traditions differ.") on every page; table headers repeat; rows/tables/charts/cards never split; Dasha, Ashtakoota, Dosha and Dasa Koota sections start on a new page; a light print title block replaces the dark screen hero; screen-only controls, chips, language toggle, AI card and export buttons are excluded from print.
- **Charts in Print**: South Indian D1/D9 charts rendered as vector SVG, two charts per row, with legible labels (labelScale 1.7) and the Lagna marker.
- **Expanded in Print**: Dasa Koota shows all ten poruthams with counts, rules and results — still labelled experimental and unverified.
- **Automated PDF Verification**: `npm run pdf:verify` fails if the PDF contains "Export PDF", "New Match", "Send my chart summary" or "Compatibility", has fewer than 6 or more than 14 pages, or any page except the last has fewer than 300 characters. Current report: 9 pages, ~134 KB, all fonts embedded, all pages dense, forbidden strings absent, per-page raster images at 80 dpi under `pdf_pages/page-images/`.
- **E2E Tests**: `e2e/print_routes.spec.ts` — 4 tests over the print routes (content present, screen-only controls absent, Dasa Koota expanded without interaction, Kannada shaping).

## [1.1.0] - 2026-11-08

### Changed
- **Lunar Node Calculation (Mean Node Default)**: Switched the default calculation for Rahu and Ketu to the astronomical Mean Lunar Node (`swe.MEAN_NODE`), matching classical Indian ephemerides and Prokerala benchmarks within 1.0 arcminute.
- **Node Type Selection (`node_type`)**: Added `node_type = "mean" | "true"` configuration to birth chart and marriage match calculation endpoints. Mean node is the verified default; True node (`swe.TRUE_NODE`) remains fully selectable.
- **Methodology Version Bump**: Bumped calculation methodology version to `v1.1.0`.

### Added
- **Node Type Transparency**: Explicit display of active `node_type` alongside `ayanamsa` in report headers and the astrologer calculation breakdown.
- **Astronomical Shift Clarification**: Informational note explaining that the ~8 arcminute difference in Rahu/Ketu positions between software tools arises strictly from the astronomical node convention (Mean vs. True node), rather than a mathematical or observational calculation error.
- **External Benchmarking**: Validated Lagna and all 9 Grahas against independent screenshot tables within 1.0 arcminute tolerance.

## [1.0.0] - 2026-11-08
- Initial release of Kundli calculation engine with Swiss Ephemeris (`pyswisseph`), Ashtakoota Milan, Dasa Koota, Dosha Samya, and DPDP Act compliance.
