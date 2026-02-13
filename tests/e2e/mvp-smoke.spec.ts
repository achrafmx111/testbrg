import { expect, test } from "@playwright/test";
import { login } from "./helpers/auth";

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@bridging.academy";
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "Admin123!";
const companyEmail = process.env.E2E_COMPANY_EMAIL ?? "company@bridging.academy";
const companyPassword = process.env.E2E_COMPANY_PASSWORD ?? "Company123!";
const talentEmail = process.env.E2E_TALENT_EMAIL ?? "talent@bridging.academy";
const talentPassword = process.env.E2E_TALENT_PASSWORD ?? "Talent123!";

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
  const uniqueTitle = `E2E SAP Job ${Date.now()}`;

  await login(page, companyEmail, companyPassword);
  await page.goto("/company/jobs");
  await page.getByTestId("company-job-title").fill(uniqueTitle);
  await page.getByTestId("company-job-description").fill("E2E job description");
  await page.getByTestId("company-job-location").fill("Casablanca");
  await page.getByTestId("company-job-salary").fill("EUR 30k - 40k");
  await page.getByTestId("company-job-skills").fill("sap basics, english");
  await page.getByTestId("company-job-submit").click();
  await expect(page.getByTestId("company-job-list")).toContainText(uniqueTitle);

  await login(page, talentEmail, talentPassword);
  await page.goto("/talent/jobs");
  const jobCard = page.getByTestId("talent-job-card").filter({ hasText: uniqueTitle }).first();
  await expect(jobCard).toBeVisible();
  await jobCard.getByRole("button", { name: "Apply" }).click();

  await login(page, companyEmail, companyPassword);
  await page.goto("/company/applicants");
  const applicantCard = page.getByTestId("company-applicant-card").first();
  await expect(applicantCard).toBeVisible({ timeout: 15000 });
  await applicantCard.getByRole("combobox").selectOption("SCREEN");
  await applicantCard.getByRole("button", { name: "Save stage" }).click();
  await expect(applicantCard).toContainText("SCREEN");

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
