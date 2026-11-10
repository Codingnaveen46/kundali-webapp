# AGENTS.md

## External astrological data — usage rule (mandatory)

Values a user transcribes from an external astrology site/tool (OnlineJyotish, Drik Panchang, Proketro-style reports, Jagannatha Hora exports, etc.) are treated as external reference **data only**:

1. **Storage**: they live only in `backend/tests/fixtures/external/` as fixture files (e.g. `onlinejyotish_reference.json`), marked "values only", with the tolerances stated alongside (`position_arcseconds`, `dasha_days`, …).
2. **Usage**: fixtures are consumed **only by comparison / verification tests** (`tests/test_external_*_reference.py` and diff scripts), against the tolerances declared in the fixture.
3. **Forbidden**: never import, read or copy fixture values into calculation code (`backend/app/**`), frontend code, or report content. Calculations must depend only on this project's own Swiss-Ephemeris engine and rule data.
4. **No site text**: do not copy any text, verse, citation, explanation, prediction, remedy, verdict, recommendation layout or **branding/tool name** from an external site into the app (components, PDFs, CSS, copy, metadata). External provenance may be referenced in test fixtures by tool name only where the user themself stated it.
5. App(copy) claims about rule sources must keep the project's own verification wording ("unverified; traditions differ", "not reviewed by an astrologer") exactly as established — external agreement never upgrades a rule to "verified" without a human review decision.

When adding new comparison tests, prefer reusing the existing reference persons in `tests/test_phase3_janma_reference.py` and any per-koota engine name mappings (e.g. fixture "Maitri" ↔ engine "Graha Maitri").
