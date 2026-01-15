import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { organizationMembers, organizations } from "../../db/schema.ts";
import { ForbiddenError, NotFoundError } from "../../lib/errors.ts";

export async function getOrganizationPermissions(
  userId: string,
  organizationId: string,
) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  if (!org) {
    throw new NotFoundError("Organization", "ORGANIZATION_NOT_FOUND");
  }

  const [membership] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new ForbiddenError(
      "User is not a member of the organization",
      "NOT_ORGANIZATION_MEMBER",
    );
  }

  const isAdmin = membership.permission === "admin";
  const isMember = membership.permission === "member";

  return {
    organization: org,
    membership,
    canRead: true,
    canUpdate: isAdmin,
    canDelete: isAdmin,
    canInviteMembers: isAdmin,
    canRemoveMembers: isAdmin,
    canCreateChannels: isAdmin || isMember,
  };
}

export async function requireOrganizationMembership(
  userId: string,
  organizationId: string,
) {
  const [membership] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new ForbiddenError(
      "User is not a member of the organization",
      "NOT_ORGANIZATION_MEMBER",
    );
  }

  return membership;
}
