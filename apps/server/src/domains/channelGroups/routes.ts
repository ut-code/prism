import { Elysia, t } from "elysia";
import { db } from "../../db/index.ts";
import {
  BadRequestError,
  ForbiddenError,
  handleError,
  NotFoundError,
  UnauthorizedError,
} from "../../lib/errors.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { getOrganizationPermissions } from "../organizations/permissions.ts";
import {
  createChannelGroup,
  deleteChannelGroup,
  getChannelGroupById,
  getChannelGroups,
  updateChannelGroup,
} from "./queries.ts";

export const channelGroupRoutes = new Elysia({ prefix: "/channel-groups" })
  .use(authMiddleware)
  .get(
    "/",
    async ({ user, query, set }) => {
      try {
        if (!user) throw new UnauthorizedError();

        await getOrganizationPermissions(user.id, query.organizationId);
        return getChannelGroups(db, query.organizationId);
      } catch (error) {
        return handleError(error, set);
      }
    },
    {
      query: t.Object({
        organizationId: t.String(),
      }),
    },
  )
  .get("/:id", async ({ user, params, set }) => {
    try {
      if (!user) throw new UnauthorizedError();

      const group = await getChannelGroupById(db, params.id);
      if (!group) throw new NotFoundError("Channel group", "GROUP_NOT_FOUND");

      await getOrganizationPermissions(user.id, group.organizationId);
      return group;
    } catch (error) {
      return handleError(error, set);
    }
  })
  .post(
    "/",
    async ({ user, body, set }) => {
      try {
        if (!user) throw new UnauthorizedError();

        const perms = await getOrganizationPermissions(
          user.id,
          body.organizationId,
        );
        if (!perms.canCreateChannels) {
          throw new ForbiddenError(
            "Insufficient permissions",
            "CANNOT_CREATE_GROUP",
          );
        }

        if (body.parentGroupId) {
          const parent = await getChannelGroupById(db, body.parentGroupId);
          if (!parent || parent.organizationId !== body.organizationId) {
            throw new BadRequestError(
              "Invalid parent group",
              "INVALID_PARENT_GROUP",
            );
          }
        }

        return createChannelGroup(db, body);
      } catch (error) {
        return handleError(error, set);
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        organizationId: t.String(),
        parentGroupId: t.Optional(t.String()),
      }),
    },
  )
  .patch(
    "/:id",
    async ({ user, params, body, set }) => {
      try {
        if (!user) throw new UnauthorizedError();

        const group = await getChannelGroupById(db, params.id);
        if (!group) throw new NotFoundError("Channel group", "GROUP_NOT_FOUND");

        const perms = await getOrganizationPermissions(
          user.id,
          group.organizationId,
        );
        if (!perms.canCreateChannels) {
          throw new ForbiddenError(
            "Insufficient permissions",
            "CANNOT_UPDATE_GROUP",
          );
        }

        if (body.parentGroupId) {
          const parent = await getChannelGroupById(db, body.parentGroupId);
          if (!parent || parent.organizationId !== group.organizationId) {
            throw new BadRequestError(
              "Invalid parent group",
              "INVALID_PARENT_GROUP",
            );
          }
        }

        const updated = await updateChannelGroup(db, params.id, body);
        if (!updated)
          throw new NotFoundError("Channel group", "GROUP_NOT_FOUND");

        return updated;
      } catch (error) {
        return handleError(error, set);
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        parentGroupId: t.Optional(t.Nullable(t.String())),
        order: t.Optional(t.Number()),
      }),
    },
  )
  .delete("/:id", async ({ user, params, set }) => {
    try {
      if (!user) throw new UnauthorizedError();

      const group = await getChannelGroupById(db, params.id);
      if (!group) throw new NotFoundError("Channel group", "GROUP_NOT_FOUND");

      const perms = await getOrganizationPermissions(
        user.id,
        group.organizationId,
      );
      if (!perms.canCreateChannels) {
        throw new ForbiddenError(
          "Insufficient permissions",
          "CANNOT_DELETE_GROUP",
        );
      }

      const deleted = await deleteChannelGroup(db, params.id);
      if (!deleted) throw new NotFoundError("Channel group", "GROUP_NOT_FOUND");

      return deleted;
    } catch (error) {
      return handleError(error, set);
    }
  });
