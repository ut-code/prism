import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate to personalization page", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Dev Organization").click();
    await expect(page).toHaveURL(/\/orgs\//, { timeout: 10000 });

    // Click on personalization link
    await page.getByRole("link", { name: "個人設定" }).click();

    // Verify URL changed to personalization
    await expect(page).toHaveURL(/\/personalization/);

    // Verify personalization page content is visible
    await expect(page.getByText("名前の変更")).toBeVisible();
  });

  test("should show organization name in sidebar", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Dev Organization").click();
    await expect(page).toHaveURL(/\/orgs\//, { timeout: 10000 });

    // Verify organization name is displayed
    await expect(page.getByText("Dev Organization")).toBeVisible();
  });

  test("should show channels section header", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Dev Organization").click();
    await expect(page).toHaveURL(/\/orgs\//, { timeout: 10000 });

    // Verify "Channels" section is visible
    await expect(page.getByText("Channels", { exact: true })).toBeVisible();
  });

  test("should show direct messages section", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Dev Organization").click();
    await expect(page).toHaveURL(/\/orgs\//, { timeout: 10000 });

    // Verify "Direct Messages" section is visible
    await expect(page.getByText("Direct Messages")).toBeVisible();
  });
});
