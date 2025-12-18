import { expect, test } from "@playwright/test";

test.describe("Channel functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByText("Dev Organization").click();
    await expect(page).toHaveURL(/\/orgs\//, { timeout: 10000 });
  });

  test("should create a new channel", async ({ page }) => {
    // Click the create channel button (+ button next to "Channels")
    await page.getByTitle("新しいチャンネル").click();

    // Fill in the channel name
    const channelName = `test-channel-${Date.now()}`;
    await page.getByPlaceholder("チャンネル名").fill(channelName);

    // Click create button (exact match to avoid matching "投票を作成")
    await page.getByRole("button", { name: "作成", exact: true }).click();

    // Wait for modal to close and reload to see new channel
    await page.waitForTimeout(500);
    await page.reload();

    // Wait for the channel to appear in the list
    const newChannel = page.getByRole("link", { name: channelName });
    await expect(newChannel).toBeVisible({ timeout: 10000 });
  });

  test("should switch between channels", async ({ page }) => {
    // Click on general channel
    await page.getByRole("link", { name: /general/i }).click();

    // Verify URL changed
    await expect(page).toHaveURL(/\/chat\//);

    // Verify channel header shows "general"
    await expect(page.getByRole("heading", { name: /general/i })).toBeVisible();

    // Create a new channel to switch to
    await page.getByTitle("新しいチャンネル").click();
    const newChannelName = `switch-test-${Date.now()}`;
    await page.getByPlaceholder("チャンネル名").fill(newChannelName);
    await page.getByRole("button", { name: "作成", exact: true }).click();

    // Reload to see new channel
    await page.waitForTimeout(500);
    await page.reload();

    // Wait for channel to appear and click it
    const newChannel = page.getByRole("link", { name: newChannelName });
    await expect(newChannel).toBeVisible({ timeout: 10000 });
    await newChannel.click();

    // Verify we switched to the new channel
    await expect(
      page.getByRole("heading", { name: newChannelName }),
    ).toBeVisible();
  });

  test("should show channel description", async ({ page }) => {
    // Click on general channel
    await page.getByRole("link", { name: /general/i }).click();

    // Wait for channel to load
    await expect(page.getByRole("heading", { name: /general/i })).toBeVisible();

    // Check that description is shown (seeded with "General discussion")
    await expect(page.getByText("General discussion")).toBeVisible();
  });
});
