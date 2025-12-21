import { expect, test } from "@playwright/test";

test.describe("Message functionality", () => {
  test("should send and display a message", async ({ page }) => {
    // Navigate to the app (with DISABLE_AUTH, user is auto-logged in)
    await page.goto("/");

    // Select the Dev Organization from org selection page
    await page.getByText("Dev Organization").click();

    // Wait for redirect to organization page
    await expect(page).toHaveURL(/\/orgs\//, { timeout: 10000 });

    // Find and click on the general channel (created by seed)
    const generalChannel = page.getByRole("link", { name: /general/i });
    await expect(generalChannel).toBeVisible();
    await generalChannel.click();

    // Wait for messages to finish loading
    await expect(page.getByText("メッセージを読み込み中")).toBeHidden({
      timeout: 10000,
    });

    // Find the message input
    const messageInput = page.getByPlaceholder(/メッセージ|message/i);
    await expect(messageInput).toBeVisible();

    // Type a test message
    const testMessage = `E2E Test Message ${Date.now()}`;
    await messageInput.fill(testMessage);

    // Send the message (Ctrl+Enter or click send button)
    await page.keyboard.press("Control+Enter");

    // Wait for the message to appear in the list (via WebSocket)
    const sentMessage = page.getByText(testMessage);
    await expect(sentMessage).toBeVisible({ timeout: 10000 });
  });

  test("should display channel header", async ({ page }) => {
    await page.goto("/");

    // Select the Dev Organization
    await page.getByText("Dev Organization").click();
    await expect(page).toHaveURL(/\/orgs\//, { timeout: 10000 });

    // Navigate to general channel
    const generalChannel = page.getByRole("link", { name: /general/i });
    await expect(generalChannel).toBeVisible();
    await generalChannel.click();

    // Check that channel header shows channel name
    const channelHeader = page.getByRole("heading", { name: /general/i });
    await expect(channelHeader).toBeVisible();
  });
});
