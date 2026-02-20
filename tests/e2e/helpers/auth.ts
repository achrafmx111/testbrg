import { expect, Page } from "@playwright/test";

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
  try {
    await expect(page).not.toHaveURL(/\/login$/, { timeout: 5000 });
  } catch {
    await page.getByTestId("login-submit").click();
    await expect(page).not.toHaveURL(/\/login$/, { timeout: 10000 });
  }
}
