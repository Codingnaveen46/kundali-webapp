import { test, expect } from "@playwright/test";

test.describe("Mobile Viewport E2E Flows", () => {
  test.beforeEach(async ({ page }) => {
    // Set DPDP consent in localStorage so modal doesn't intercept pointer events
    await page.addInitScript(() => {
      localStorage.setItem("kundli_dpdp_consent", "accepted");
    });
    // Navigate to homepage
    await page.goto("/");
  });

  test("Flow 1: Birth chart manual entry, review screen, and South Indian default chart on mobile", async ({ page }) => {
    // 1. Verify Header & Tab
    await expect(page.locator("header")).toBeVisible();
    await expect(page.getByRole("button", { name: /Janma Kundali/i })).toBeVisible();

    // 2. Select Manual Form in Intake Panel if not active
    const manualTabBtn = page.getByRole("button", { name: /Manual Form/i });
    if (await manualTabBtn.isVisible()) {
      await manualTabBtn.click();
    }

    // 3. Fill in Birth Details
    const nameInput = page.getByPlaceholder(/e\.g\. Arun Kumar/i);
    await nameInput.fill("Siddharth Patel");

    const dobInput = page.locator('input[type="date"]');
    await dobInput.fill("1995-10-24");

    // 4. Tap Review & Generate
    await page.getByRole("button", { name: /Review & Generate/i }).click();

    // 5. Review Screen verification
    await expect(page.getByText(/Review.*Details/i)).toBeVisible();
    await expect(page.getByText(/Date in words:/i)).toBeVisible();
    await expect(page.getByText(/(24 October 1995|October 24, 1995)/i)).toBeVisible();

    // 6. Confirm on Review Screen
    await page.getByRole("button", { name: /Confirm & Generate Kundali/i }).click();

    // 7. Verify Chart Report Rendered
    await expect(page.getByText("Siddharth Patel")).toBeVisible();
    await expect(page.getByText(/Graha Table/i)).toBeVisible();

    // Verify South Indian Chart (Default)
    const southChartSvg = page.locator("#chart-render-d1-south svg");
    await expect(southChartSvg).toBeVisible();
    await expect(page.getByText(/South Indian Format/i)).toBeVisible();

    // 8. Toggle to North Indian Chart Style
    await page.getByRole("button", { name: /North Indian/i }).click();
    const northChartSvg = page.locator("#chart-render-d1-north svg");
    await expect(northChartSvg).toBeVisible();

    // 9. Toggle to Navamsa (D9)
    await page.getByRole("button", { name: /Navamsa \(D9\)/i }).click();
    await expect(page.getByText(/Navamsa \(D9\)/i).first()).toBeVisible();

    // 10. Verify Panchanga and Vimshottari Dasha sections
    await expect(page.getByText(/Panchanga at Birth/i)).toBeVisible();
    await expect(page.getByText(/Vimshottari Dasha Timeline/i)).toBeVisible();
    await expect(page.getByText(/Active Now/i)).toBeVisible();
  });

  test("Flow 2: Unknown birth time generates Moon-based chart with clear exclusions", async ({ page }) => {
    // 1. Select Manual Form
    const manualTabBtn = page.getByRole("button", { name: /Manual Form/i });
    if (await manualTabBtn.isVisible()) {
      await manualTabBtn.click();
    }

    // 2. Fill Name & Date
    await page.getByPlaceholder(/e\.g\. Arun Kumar/i).fill("Sunita Devi");
    await page.locator('input[type="date"]').fill("1996-11-24");

    // 3. Toggle "Time Unknown"
    await page.getByLabel(/Time Unknown/i).check();
    await expect(page.getByText(/Moon-based results only/i)).toBeVisible();

    // 4. Submit & Confirm
    await page.getByRole("button", { name: /Review & Generate/i }).click();
    await page.getByRole("button", { name: /Confirm & Generate Kundali/i }).click();

    // 5. Verify Lagna is omitted and marked "Time Unknown"
    await expect(page.getByText("Sunita Devi")).toBeVisible();
    await expect(page.getByText(/Time Unknown \(Solar Noon\)/i)).toBeVisible();
    await expect(page.getByText(/Chandra Lagna/i)).toBeVisible();
  });

  test("Flow 3: Marriage matching flow with Ashtakoota, Nadi/Bhakoot checks, and Dasa Koota", async ({ page }) => {
    // 1. Switch to Marriage Matching tab
    await page.getByRole("button", { name: /Marriage Matching/i }).click();
    await expect(page.getByText(/Kundali Milan: Ashtakoota & Dasa Koota/i)).toBeVisible();

    // 2. Groom: Use Paste Text sample
    const groomPanel = page.getByTestId("intake-panel-groom-details");
    const pasteTab = groomPanel.getByRole("button", { name: /Paste Text/i });
    await pasteTab.click();

    // Click sample 1 button
    await groomPanel.getByRole("button", { name: /Sample 1: Standard Biodata/i }).click();
    await groomPanel.getByRole("button", { name: /Extract & Review Details/i }).click();

    // Confirm Groom on Review Screen
    await groomPanel.getByRole("button", { name: /Confirm & Generate Kundali/i }).click();
    await expect(page.getByText(/✓ Groom confirmed: Rajesh Kumar/i)).toBeVisible();

    // 3. Bride: Fill Manual Form
    const bridePanel = page.getByTestId("intake-panel-bride-details");
    const brideManualTab = bridePanel.getByRole("button", { name: /Manual Form/i });
    if (await brideManualTab.isVisible()) {
      await brideManualTab.click();
    }

    await bridePanel.getByPlaceholder(/e\.g\. Arun Kumar/i).fill("Pooja Sharma");
    await bridePanel.locator('input[type="date"]').fill("1996-05-18");
    await bridePanel.getByRole("button", { name: /Review & Generate/i }).click();

    // Confirm Bride on Review Screen
    await bridePanel.getByRole("button", { name: /Confirm & Generate Kundali/i }).click();
    await expect(page.getByText(/✓ Bride confirmed: Pooja Sharma/i)).toBeVisible();

    // 4. Calculate Match
    await page.getByRole("button", { name: /Calculate Ashtakoota & Dasa Koota Match/i }).click();

    // 5. Verify Match Report
    await expect(page.getByText(/Rajesh Kumar & Pooja Sharma/i)).toBeVisible();
    await expect(page.getByText(/Ashtakoota Milan \(8 Classical Dimensions/i)).toBeVisible();
    await expect(page.getByText(/Dasa Koota \(10 Poruthams/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Dosha Samya/i })).toBeVisible();
    await expect(page.getByText(/Export Clean PDF/i)).toBeVisible();
  });

  test("Flow 4: Internationalization (i18n) and Dark Mode", async ({ page }) => {
    // 1. Switch language to Kannada
    await page.getByRole("button", { name: "ಕನ್ನಡ" }).click();
    await expect(page.getByRole("button", { name: /ಜನ್ಮ ಕುಂಡಲಿ/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /ವಿವಾಹ ಹೊಂದಾಣಿಕೆ/i })).toBeVisible();

    // 2. Switch language to Hindi
    await page.getByRole("button", { name: "हिन्दी" }).click();
    await expect(page.getByRole("button", { name: /जन्म कुण्डली/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /विवाह मिलान/i })).toBeVisible();

    // 3. Switch back to English
    await page.getByRole("button", { name: "English" }).click();
    await expect(page.getByRole("button", { name: /Janma Kundali/i })).toBeVisible();

    // 4. Toggle Dark Mode
    const darkToggleBtn = page.getByTitle(/Toggle Dark Mode/i);
    await darkToggleBtn.click();
  });
});
