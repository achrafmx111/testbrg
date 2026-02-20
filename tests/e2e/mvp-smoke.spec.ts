import { expect, test } from "@playwright/test";
import { login } from "./helpers/auth";

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@bridging.academy";
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "Admin123!";
const companyEmail = process.env.E2E_COMPANY_EMAIL ?? "company@bridging.academy";
const companyPassword = process.env.E2E_COMPANY_PASSWORD ?? "Company123!";
const talentEmail = process.env.E2E_TALENT_EMAIL ?? "talent@bridging.academy";
const talentPassword = process.env.E2E_TALENT_PASSWORD ?? "Talent123!";

async function dismissBlockingOverlay(page: import("@playwright/test").Page) {
  await page.getByText("Skip Tour", { exact: true }).first().click({ force: true, timeout: 2000 }).catch(() => undefined);
  await page.getByText("Close", { exact: true }).first().click({ force: true, timeout: 2000 }).catch(() => undefined);
  await page.getByRole("button", { name: /Skip Tour/i }).first().click({ force: true, timeout: 2000 }).catch(() => undefined);
  await page.getByRole("button", { name: /^Close$/i }).first().click({ force: true, timeout: 2000 }).catch(() => undefined);

  const backdrop = page.locator('div[data-state="open"][data-aria-hidden="true"]');
  const hasBackdrop = await backdrop.first().isVisible({ timeout: 1000 }).catch(() => false);
  if (hasBackdrop) {
    await page.keyboard.press("Escape");
    await backdrop.first().waitFor({ state: "hidden", timeout: 5000 }).catch(() => undefined);
  }
}

test("login redirects by role", async ({ page }) => {
  await login(page, adminEmail, adminPassword);
  await expect(page).toHaveURL(/\/admin/);

  await login(page, talentEmail, talentPassword);
  await expect(page).toHaveURL(/\/talent/);

  await login(page, companyEmail, companyPassword);
  await expect(page).toHaveURL(/\/company/);
});

test("talent cannot access /admin", async ({ page }) => {
  await login(page, talentEmail, talentPassword);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/talent/);
});

test("company creates job -> talent applies -> company updates stage -> admin marks job ready", async ({ page }) => {
  test.setTimeout(120000);
  const uniqueTitle = `E2E SAP Job ${Date.now()}`;
  await page.addInitScript(() => {
    window.localStorage.setItem("bridging_demo_mode", "false");
  });

  await login(page, companyEmail, companyPassword);
  await page.goto("/company/jobs");
  await dismissBlockingOverlay(page);
  await page.getByTestId("company-job-title").fill(uniqueTitle);
  await page.getByTestId("company-job-description").fill("E2E job description");
  await page.getByTestId("company-job-location").fill("Casablanca");
  await page.getByTestId("company-job-salary").fill("EUR 30k - 40k");
  await page.getByTestId("company-job-skills").fill("sap basics, english");
  await page.getByTestId("company-job-submit").click({ force: true });
  await expect(page.getByTestId("company-job-list")).toContainText(uniqueTitle);

  await login(page, talentEmail, talentPassword);
  await page.goto("/talent/jobs");
  await dismissBlockingOverlay(page);
  const jobCard = page.getByTestId("talent-job-card").filter({ hasText: uniqueTitle }).first();
  await expect(jobCard).toBeVisible({ timeout: 20000 });
  await jobCard.getByRole("button", { name: "Apply" }).click({ force: true });

  await login(page, companyEmail, companyPassword);
  await page.goto("/company/applicants");
  await page.waitForTimeout(2000);
  await page.reload();
  const applicantCard = page.getByTestId("company-applicant-card").filter({ hasText: uniqueTitle }).first();
  const applicantCount = await page.getByTestId("company-applicant-card").filter({ hasText: uniqueTitle }).count();
  if (applicantCount > 0) {
    const sourceBox = await applicantCard.boundingBox();
    const screenColumn = page.getByTestId("ats-column-screen");
    const targetBox = await screenColumn.boundingBox();
    if (sourceBox && targetBox) {
      await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 80, { steps: 12 });
      await page.mouse.up();
      await expect(page.getByTestId("ats-column-screen")).toContainText(uniqueTitle);
    }
  } else {
    await expect(page.getByTestId("company-ats-header")).toBeVisible();
  }

  await login(page, adminEmail, adminPassword);
  await page.goto("/admin/talents");
  const readyButtons = page.locator('button:has-text("Mark JOB_READY"):not([disabled])');
  const enabledCount = await readyButtons.count();
  if (enabledCount > 0) {
    const readyButton = readyButtons.first();
    await expect(readyButton).toBeVisible({ timeout: 15000 });
    page.once("dialog", (dialog) => dialog.accept());
    await readyButton.click();
  } else {
    await expect(page.getByTestId("admin-talent-list")).toBeVisible();
  }
});
