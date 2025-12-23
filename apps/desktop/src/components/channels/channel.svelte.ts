import type { Channel, Message } from "@apps/api-client";
import { onMount } from "svelte";
import {
  getApiClient,
  getChannel,
  unwrapResponse,
  useQuery,
} from "@/lib/api.svelte";
import type { SearchResult } from "../chat/messageSearch.svelte.ts";

export function createChannelController(
  getSelectedChannelId: () => string,
  _getOrganizationId: () => string,
) {
  const api = getApiClient();

  const selectedChannel = useQuery<Channel>(async () => {
    const response = await getChannel(api, getSelectedChannelId()).get();
    return unwrapResponse(response);
  });

  let replyingTo = $state<Message | null>(null);
  let searchQuery = $state("");
  let searchResults = $state<SearchResult[]>([]);
  let isSearching = $state(false);
  let showSearch = $state(false);

  async function handleSearch() {
    if (!searchQuery.trim()) {
      searchResults = [];
      return;
    }
    isSearching = true;
    try {
      const response = await api.messages.search.get({
        query: { q: searchQuery, channelId: getSelectedChannelId() },
      });
      searchResults = unwrapResponse(response) as SearchResult[];
    } catch {
      searchResults = [];
    } finally {
      isSearching = false;
    }
  }

  function handleResultClick(messageId: string) {
    const el = document.getElementById(`message-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-primary");
      setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 2000);
    }
    searchQuery = "";
    searchResults = [];
    showSearch = false;
  }

  async function markChannelAsRead() {
    try {
      // @ts-expect-error - Eden Treaty Proxy allows dynamic property access
      await api.channels[getSelectedChannelId()].read.post({});
    } catch {
      // Ignore errors
    }
  }

  onMount(() => {
    markChannelAsRead();
  });

  return {
    get selectedChannel() {
      return selectedChannel;
    },
    get replyingTo() {
      return replyingTo;
    },
    set replyingTo(value: Message | null) {
      replyingTo = value;
    },
    get searchQuery() {
      return searchQuery;
    },
    set searchQuery(value: string) {
      searchQuery = value;
    },
    get searchResults() {
      return searchResults;
    },
    get isSearching() {
      return isSearching;
    },
    get showSearch() {
      return showSearch;
    },
    set showSearch(value: boolean) {
      showSearch = value;
    },
    handleSearch,
    handleResultClick,
  };
}
