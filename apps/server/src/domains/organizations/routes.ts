import { Elysia } from "elysia";
import { authMiddleware } from "../../middleware/auth.ts";
import { organizationReadRoutes } from "./crud-read.ts";
import { organizationWriteRoutes } from "./crud-write.ts";
import { organizationMemberAddRoute } from "./members-add.ts";
import { organizationMemberReadRoutes } from "./members-read.ts";
import { organizationMemberRemoveRoute } from "./members-remove.ts";

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
