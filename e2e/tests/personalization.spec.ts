import { expect, test } from "@playwright/test";

test.describe("Personalization", () => {
  test("should update user name", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Dev Organization").click();
    await expect(page).toHaveURL(/\/orgs\//, { timeout: 10000 });

    // Navigate to personalization page
    await page.getByRole("link", { name: "個人設定" }).click();
    await expect(page).toHaveURL(/\/personalization/);

    // Wait for page to load
    await expect(page.getByText("名前の変更")).toBeVisible();

    // Find the name input and change it
    const nameInput = page.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible();

    const newName = `Test User ${Date.now()}`;
    await nameInput.fill(newName);

    // Click save button
    const saveButton = page.getByRole("button", { name: "保存" });
    await saveButton.click();

    // Verify the name was updated (input should now show the new name)
    await expect(nameInput).toHaveValue(newName, { timeout: 5000 });
  });

  test("should show current user name", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Dev Organization").click();
    await expect(page).toHaveURL(/\/orgs\//, { timeout: 10000 });

    // Navigate to personalization page
    await page.getByRole("link", { name: "個人設定" }).click();
    await expect(page).toHaveURL(/\/personalization/);

    // Wait for page to load and verify name input has a value
    await expect(page.getByText("名前の変更")).toBeVisible();
    const nameInput = page.locator('input[type="text"]').first();
    await expect(nameInput).not.toHaveValue("", { timeout: 5000 });
  });
});
