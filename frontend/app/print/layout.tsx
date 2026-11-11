import "./print.css";
import type { Metadata } from "next";
import { ZodiacWheel } from "@/components/charts/ZodiacWheel";

/**
 * Layout for the dedicated print routes (/print/*).
 * Renders ONLY report content in a print-specific layout: no site header,
 * no dark hero, no language toggle, no export buttons, no AI card.
 * The PDF workflow uses the browser print-to-PDF (window.print), never
 * html2canvas/jsPDF image capture — all text stays selectable and searchable.
 *
 * Screen: dark cosmic surround (ambient zodiac wheel) behind the floating
 * white A4 sheet. Print/PDF: the ambient layer is display:none — the
 * document prints on white paper exactly as before.
 */
export const metadata: Metadata = {
  title: "Kundli (ಕುಂಡಲಿ) Print Layout",
};

export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ZodiacWheel variant="ambient" />
      <div className="print-doc">{children}</div>
    </>
  );
}
