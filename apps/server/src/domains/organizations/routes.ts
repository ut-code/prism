import { Elysia } from "elysia";
import { authMiddleware } from "../../middleware/auth";
import { organizationReadRoutes } from "./crud-read";
import { organizationWriteRoutes } from "./crud-write";
import { organizationMemberAddRoute } from "./members-add";
import { organizationMemberReadRoutes } from "./members-read";
import { organizationMemberRemoveRoute } from "./members-remove";

/**
 * Organization routes aggregator
 * Combines CRUD and member management routes under /organizations prefix
 */
export const organizationRoutes = new Elysia({ prefix: "/organizations" })
  .use(authMiddleware)
  .use(organizationReadRoutes)
  .use(organizationWriteRoutes)
  .use(organizationMemberReadRoutes)
  .use(organizationMemberAddRoute)
  .use(organizationMemberRemoveRoute);
