/**
 * Client-side high-fidelity PDF export using html2canvas and jsPDF.
 * Preserves privacy: generated entirely in browser memory.
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportReportToPdf(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element #${elementId} not found for PDF generation.`);
  }

  // Render element to canvas
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const totalPdfHeight = (canvasHeight * pdfWidth) / canvasWidth;
  let heightLeft = totalPdfHeight;
  let position = 0;

  // Add first page
  pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, totalPdfHeight);
  heightLeft -= pdfHeight;

  // Add subsequent pages if report exceeds 1 page
  while (heightLeft > 0) {
    position = heightLeft - totalPdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(filename);
}
