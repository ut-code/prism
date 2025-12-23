import type { Organization, OrganizationMember } from "@packages/api-client";
import {
  getApiClient,
  getOrganization,
  unwrapResponse,
  useMutation,
  useQuery,
} from "@/lib/api.svelte";

/**
 * Data fetching hooks for organization settings.
 * Provides reactive queries and mutations for organization data.
 */

export function useOrganizationData(organizationId: () => string) {
  const api = getApiClient();

  const organization = useQuery(async () => {
    const response = await getOrganization(api, organizationId()).get();
    return unwrapResponse<Organization>(
      response as {
        data?: Organization | null;
        error?: { status: number; value: unknown } | null;
      },
    );
  });

  const members = useQuery(async () => {
    const response = await getOrganization(api, organizationId()).members.get();
    return unwrapResponse<OrganizationMember[]>(
      response as {
        data?: OrganizationMember[] | null;
        error?: { status: number; value: unknown } | null;
      },
    );
  });

  return { organization, members, api };
}

export function useOrganizationMutations() {
  const api = getApiClient();

  const updateOrganization = useMutation(
    async (args: { id: string; name: string; description: string }) => {
      const response = await getOrganization(api, args.id).patch({
        name: args.name,
        description: args.description,
      });
      return unwrapResponse<Organization>(
        response as {
          data?: Organization | null;
          error?: { status: number; value: unknown } | null;
        },
      );
    },
  );

  const removeMember = useMutation(
    async (args: { organizationId: string; userId: string }) => {
      const orgRoute = getOrganization(api, args.organizationId);
      const memberRoute = orgRoute.members[args.userId];
      if (!memberRoute) {
        throw new Error("Member route not found");
      }
      const response = await memberRoute.delete();
      unwrapResponse(response);
    },
  );

  return { updateOrganization, removeMember };
}
