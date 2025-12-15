// Type definitions for API responses

export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  permission?: "admin" | "member" | "visitor";
  role?: string | null;
}

export interface Channel {
  id: string;
  name: string;
  description?: string | null;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  channelId: string;
  content: string;
  author: string;
  userId: string;
  parentId?: string | null;
  voteId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Extended fields (may be populated by joins or separate queries)
  attachments?: string[]; // Array of file IDs
  vote?: string; // Vote ID (alias for voteId)
}

export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface File {
  id: string;
  storageId: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  organizationId: string;
  width?: number;
  height?: number;
  uploadedAt: Date;
  url?: string; // Generated URL for file access
}

export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  assigner: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vote {
  id: string;
  title: string;
  maxVotes: number;
  voteOptions: string[];
  voters: Array<{ userId: string; votedOptions: number[] }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role?: string;
  permission: "admin" | "member" | "visitor";
  joinedAt: Date;
  user?: User;
}
