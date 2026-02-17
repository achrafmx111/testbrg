import { expect, test } from "@playwright/test";
import { login } from "./helpers/auth";

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@bridging.academy";
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "Admin123!";
const companyEmail = process.env.E2E_COMPANY_EMAIL ?? "company@bridging.academy";
const companyPassword = process.env.E2E_COMPANY_PASSWORD ?? "Company123!";
const talentEmail = process.env.E2E_TALENT_EMAIL ?? "talent@bridging.academy";
const talentPassword = process.env.E2E_TALENT_PASSWORD ?? "Talent123!";

test("role login redirects to dashboard workspace", async ({ page }) => {
  await login(page, adminEmail, adminPassword);
  await expect(page).toHaveURL(/\/admin/);

  await login(page, companyEmail, companyPassword);
  await expect(page).toHaveURL(/\/company/);

  await login(page, talentEmail, talentPassword);
  await expect(page).toHaveURL(/\/talent/);
});

test("admin approval inbox supports approve action", async ({ page }) => {
  await login(page, adminEmail, adminPassword);
  await page.goto("/admin/approvals");

  await expect(page).toHaveURL(/\/admin\/approvals/);
  await expect(page.locator('[data-testid^="approval-row-"]').first()).toBeVisible();
});

test("company ATS pipeline renders key columns", async ({ page }) => {
  await login(page, companyEmail, companyPassword);
  await page.goto("/company/applicants");

  await expect(page.getByTestId("company-ats-header")).toContainText("Applicant Pipeline");
  await expect(page.getByTestId("ats-column-applied")).toBeVisible();
  await expect(page.getByTestId("ats-column-interview")).toBeVisible();
  await expect(page.getByTestId("ats-column-hired")).toBeVisible();
});

test("command palette trigger is visible in admin workspace", async ({ page }) => {
  await login(page, adminEmail, adminPassword);
  await page.goto("/admin");

  await expect(page.getByText("Search candidates, jobs, pages...")).toBeVisible();
  await expect(page.getByText("Ctrl K")).toBeVisible();
});

test("legacy /dashboard role routes redirect and keep role guard", async ({ page }) => {
  await login(page, talentEmail, talentPassword);

  await page.goto("/dashboard/talent/jobs");
  await expect(page).toHaveURL(/\/talent\/jobs/);

  await page.goto("/dashboard/admin");
  await expect(page).toHaveURL(/\/talent/);
});
