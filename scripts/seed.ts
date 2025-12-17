import { users } from "../apps/server/src/db/auth.ts";
import { channels } from "../apps/server/src/db/channels.ts";
import { db } from "../apps/server/src/db/index.ts";
import {
  organizationMembers,
  organizations,
} from "../apps/server/src/db/organizations.ts";

const MOCK_USER = {
  id: "dev-user-id",
  name: "Dev User",
  email: "dev@example.com",
};

const MOCK_ORG = {
  name: "Dev Organization",
  description: "Default organization for development",
};

async function seed() {
  console.log("🌱 Seeding database...");

  // Create mock user
  const [user] = await db
    .insert(users)
    .values(MOCK_USER)
    .onConflictDoNothing()
    .returning();

  if (user) {
    console.log(`✅ Created user: ${user.name}`);
  } else {
    console.log(`⏭️  User already exists: ${MOCK_USER.name}`);
  }

  // Create mock organization
  const [org] = await db
    .insert(organizations)
    .values({ ...MOCK_ORG, ownerId: MOCK_USER.id })
    .onConflictDoNothing()
    .returning();

  if (org) {
    console.log(`✅ Created organization: ${org.name}`);

    // Add user as admin member
    await db.insert(organizationMembers).values({
      organizationId: org.id,
      userId: MOCK_USER.id,
      permission: "admin",
    });
    console.log(`✅ Added ${MOCK_USER.name} as admin`);

    // Create general channel
    const [channel] = await db
      .insert(channels)
      .values({
        name: "general",
        description: "General discussion",
        organizationId: org.id,
      })
      .returning();
    console.log(`✅ Created channel: #${channel.name}`);
  } else {
    console.log("⏭️  Organization already exists");
  }

  console.log("🌱 Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
