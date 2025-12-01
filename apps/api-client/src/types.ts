// Type definitions for API responses

export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  permission?: string;
  role?: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
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
  parentId?: string;
  voteId?: string;
  createdAt: Date;
  updatedAt: Date;
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
