import type { ApiClient, OrganizationMember, User } from "@apps/api-client";
import { getOrganization, unwrapResponse } from "@/lib/api.svelte";

/**
 * Utility functions for member management in organization settings.
 * Handles member search, validation, and addition workflows.
 */

/**
 * Search for a user by email and add them to the organization.
 * Shows appropriate alerts for various error conditions.
 */
export async function searchAndAddMember(
  api: ApiClient,
  organizationId: string,
  currentMembers: OrganizationMember[] | undefined,
): Promise<void> {
  const email = prompt(
    "追加するメンバーのメールアドレスを入力してください",
  );
  if (!email?.trim()) return;

  // Check if member already exists
  if (currentMembers) {
    for (const m of currentMembers) {
      if (m.user?.email === email) {
        alert("そのメンバーはもう存在します");
        return;
      }
    }
  }

  // Search for user by email
  const usersResponse = await api.users.search.get({ query: { email } });
  const users = unwrapResponse<User[]>(
    usersResponse as {
      data?: User[] | null;
      error?: { status: number; value: unknown } | null;
    },
  );

  if (!users || !users.length) {
    alert("ユーザーが見つかりませんでした");
    return;
  }

  if (users.length > 1) {
    alert(
      "同じメールアドレスで登録されている人物が複数確認されました。開発者に報告してください。",
    );
    return;
  }

  const foundUser = users[0];
  if (!foundUser) {
    alert("ユーザーが見つかりませんでした");
    return;
  }

  // Confirm and add user
  const message = `以下のユーザーが見つかりました\n${foundUser.name}\n組織に追加しますか？`;
  const answer = confirm(message);
  if (answer) {
    const response = await getOrganization(api, organizationId).members.post({
      userId: foundUser.id,
      permission: "member",
    });
    await unwrapResponse(response);
  }
}
