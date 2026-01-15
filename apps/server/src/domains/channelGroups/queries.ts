import { asc, eq } from "drizzle-orm";
import type { Database } from "../../db/index.ts";
import { channelGroups } from "../../db/schema.ts";

export async function getChannelGroups(db: Database, organizationId: string) {
  return db
    .select()
    .from(channelGroups)
    .where(eq(channelGroups.organizationId, organizationId))
    .orderBy(asc(channelGroups.order));
}

export async function getChannelGroupById(db: Database, id: string) {
  const [group] = await db
    .select()
    .from(channelGroups)
    .where(eq(channelGroups.id, id))
    .limit(1);
  return group ?? null;
}

export async function createChannelGroup(
  db: Database,
  data: { name: string; organizationId: string; parentGroupId?: string | null },
) {
  const [group] = await db
    .insert(channelGroups)
    .values({
      name: data.name,
      organizationId: data.organizationId,
      parentGroupId: data.parentGroupId ?? null,
    })
    .returning();
  return group;
}

export async function updateChannelGroup(
  db: Database,
  id: string,
  data: { name?: string; parentGroupId?: string | null; order?: number },
) {
  const [group] = await db
    .update(channelGroups)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(channelGroups.id, id))
    .returning();
  return group ?? null;
}

export async function deleteChannelGroup(db: Database, id: string) {
  const [group] = await db
    .delete(channelGroups)
    .where(eq(channelGroups.id, id))
    .returning();
  return group ?? null;
}
