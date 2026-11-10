"use client";

import React from "react";

/**
 * Kannada rendering test page for the print layout (Requirement B9).
 * Exercises conjuncts (ottakshara), vowel signs, nakshatra names and numerals
 * with the locally embedded Noto Sans Kannada font. The PDF generation script
 * rasterises and checks this page for broken shaping.
 */

const CONJUNCT_SAMPLES: Array<{ label: string; text: string }> = [
  { label: "Sample name", text: "ನವೀನ್ ಎಸ್ ಮತ್ತು ಸೋನಿಕಾ ಎಂ ಆರ್" },
  { label: "Script title", text: "ವಿವಾಹ ಹೊಂದಾಣಿಕೆ ವರದಿ (ಅಷ್ಟಕೂಟ ಮತ್ತು ದಶ ಕೂಟ)" },
  { label: "Nakshatras", text: "ಹಸ್ತ ನಕ್ಷತ್ರ, ಶ್ರವಣ ನಕ್ಷತ್ರ, ರೋಹಿಣಿ, ಅಶ್ವಿನಿ, ಉತ್ತರಾಯಣ" },
  { label: "Consonant clusters", text: "ಸಂಪೂರ್ಣ ಸ್ವಾತಂತ್ರ್ಯ, ಕೃಷ್ಣ, ಸೌಮ್ಯ, ಜ್ಞಾನ, ಕ್ಷಮಾಶೀಲ" },
  { label: "Vowel signs + numbers", text: "ಗುಣ ೨೫/೩೬, ಶೇಕಡಾವಾರು ೬೯.೪; ಜನ್ಮ ದಿನಾಂಕ: ೦೪-೦೬-೧೯೯೮" },
  { label: "Rashi names", text: "ಮೇಷ, ವೃಷಭ, ಮಿಥುನ, ಕರ್ಕ, ಸಿಂಹ, ಕನ್ಯ, ತುಲ, ವೃಶ್ಚಿಕ, ಧನು, ಮಕರ, ಕುಂಭ, ಮೀನ" },
];

export default function PrintSamplePage() {
  return (
    <div className={["print-doc--kn", "print-doc--color"].filter(Boolean).join(" ")}>
      <div className="print-toolbar no-print">
        <span style={{ fontWeight: 700 }}>Print preview — Kannada shaping test page</span>
        <button
          type="button"
          onClick={() => window.print()}
          style={{ padding: "4px 12px", cursor: "pointer" }}
        >
          Print
        </button>
        <button
          type="button"
          onClick={() => window.close()}
          style={{ padding: "4px 12px", cursor: "pointer" }}
        >
          Close
        </button>
      </div>

      <div className="print-running-header">
        <span>Kannada Print Rendering Test — Noto Sans Kannada (local font)</span>
      </div>

      <div className="print-section avoid-break space-y-3" style={{ padding: "12px 0" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700 }}>
          ಕನ್ನಡ ಮುದ್ರಣ ಪರೀಕ್ಷೆ (Kannada Print Rendering Test)
        </h2>
        <p style={{ fontSize: "12px" }}>
          ಉದ್ದೇಶ: ಸ್ಥಳೀಯ ನೋಟೊ ಸಾನ್ಸ್ ಕನ್ನಡ ಫಾಂಟ್‌ನಲ್ಲಿ ಸಂಯುಕ್ತಾಕ್ಷರಗಳು, ಸ್ವರಚಿಹ್ನೆಗಳು ಮತ್ತು ಅಂಕೆಗಳು ಸರಿಯಾಗಿ ರೂಪುಗೊಳ್ಳುತ್ತಿವೆಯೆ ಎಂದು ಪರಿಶೀಲಿಸುವುದು.
        </p>

        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>ಪರೀಕ್ಷೆ (Test)</th>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>ಮಾದರಿ ಪಠ್ಯ (Sample text)</th>
            </tr>
          </thead>
          <tbody>
            {CONJUNCT_SAMPLES.map((s) => (
              <tr key={s.label} style={{ borderBottom: "1px solid #e2e2e2" }}>
                <td style={{ padding: "6px 8px", fontSize: "12px", fontFamily: "Noto Sans, sans-serif" }}>{s.label}</td>
                <td style={{ padding: "6px 8px", fontSize: "13px" }}>{s.text}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ fontSize: "12px" }}>
          ಗಮನಿಸಿ: ಈ ಪುಟವನ್ನು PDF ಆಗಿ ರಫ್‌ಮಾಡಿದ ನಂತರ ಪಠ್ಯವನ್ನು ಆಯ್ಕೆ ಮಾಡಬಹುದಾಗಿರಬೇಕು (selectable) ಮತ್ತು ಹುಡುಕಬಹುದಾಗಿರಬೇಕು (searchable).
        </p>
      </div>

      <div className="print-running-footer">
        <span>Methodology v1.1.0 · Generated 9 Nov 2026</span>
        <span>Noto Sans Kannada Typography Verification</span>
      </div>
    </div>
  );
}
