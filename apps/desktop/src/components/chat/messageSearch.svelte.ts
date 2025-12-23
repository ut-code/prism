import type { Message } from "@packages/api-client";

export interface SearchResult {
  message: Message;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  channel: {
    id: string;
    name: string;
  } | null;
}
