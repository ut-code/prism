import type { ApiClient, OrganizationMember, User } from "@packages/api-client";
import { getOrganization, unwrapResponse } from "@/lib/api.svelte";

/**
 * Utility functions for member management in organization settings.
 * Handles member search, validation, and addition workflows.
 */

/**
 * Search for a user by email and add them to the organization.
 * Throws errors for various error conditions.
 */
export async function addMemberByEmail(
  api: ApiClient,
  organizationId: string,
  email: string,
  currentMembers: OrganizationMember[] | undefined,
): Promise<void> {
  // Check if member already exists
  if (currentMembers) {
    for (const m of currentMembers) {
      if (m.user?.email === email) {
        throw new Error("This member already exists");
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
    throw new Error("User not found");
  }

  if (users.length > 1) {
    throw new Error(
      "Multiple users found with the same email address. Please report this to the developer.",
    );
  }

  const foundUser = users[0];
  if (!foundUser) {
    throw new Error("User not found");
  }

  // Add user to organization
  const response = await getOrganization(api, organizationId).members.post({
    userId: foundUser.id,
    permission: "member",
  });
  await unwrapResponse(response);
}
