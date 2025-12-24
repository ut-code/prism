import type { ApiClient, OrganizationMember, User } from "@packages/api-client";
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
  const email = prompt("Enter the email address of the member to add");
  if (!email?.trim()) return;

  // Check if member already exists
  if (currentMembers) {
    for (const m of currentMembers) {
      if (m.user?.email === email) {
        alert("This member already exists");
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
    alert("User not found");
    return;
  }

  if (users.length > 1) {
    alert(
      "Multiple users found with the same email address. Please report this to the developer.",
    );
    return;
  }

  const foundUser = users[0];
  if (!foundUser) {
    alert("User not found");
    return;
  }

  // Confirm and add user
  const message = `Found user:\n${foundUser.name}\nAdd to organization?`;
  const answer = confirm(message);
  if (answer) {
    const response = await getOrganization(api, organizationId).members.post({
      userId: foundUser.id,
      permission: "member",
    });
    await unwrapResponse(response);
  }
}
