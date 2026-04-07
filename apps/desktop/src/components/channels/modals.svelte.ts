import type { Channel } from "@packages/api-client";

/**
 * Modal state management for channel list.
 * Centralizes modal open/close logic instead of using registerOpen callbacks.
 */

interface CreateChannelModalState {
  isOpen: boolean;
  defaultGroupId: string | null;
}

interface CreateGroupModalState {
  isOpen: boolean;
  defaultParentGroupId: string | null;
}

interface RenameGroupModalState {
  isOpen: boolean;
  groupId: string;
  currentName: string;
}

interface EditChannelModalState {
  isOpen: boolean;
  channel: Channel | null;
}

interface BrowseChannelsModalState {
  isOpen: boolean;
}

class ChannelModals {
  browseChannels = $state<BrowseChannelsModalState>({ isOpen: false });
  createChannel = $state<CreateChannelModalState>({
    isOpen: false,
    defaultGroupId: null,
  });

  createGroup = $state<CreateGroupModalState>({
    isOpen: false,
    defaultParentGroupId: null,
  });

  renameGroup = $state<RenameGroupModalState>({
    isOpen: false,
    groupId: "",
    currentName: "",
  });

  editChannel = $state<EditChannelModalState>({
    isOpen: false,
    channel: null,
  });

  openCreateChannel(groupId: string | null = null) {
    this.createChannel = { isOpen: true, defaultGroupId: groupId };
  }

  closeCreateChannel() {
    this.createChannel = { isOpen: false, defaultGroupId: null };
  }

  openCreateGroup(parentGroupId: string | null = null) {
    this.createGroup = { isOpen: true, defaultParentGroupId: parentGroupId };
  }

  closeCreateGroup() {
    this.createGroup = { isOpen: false, defaultParentGroupId: null };
  }

  openRenameGroup(groupId: string, currentName: string) {
    this.renameGroup = { isOpen: true, groupId, currentName };
  }

  closeRenameGroup() {
    this.renameGroup = { isOpen: false, groupId: "", currentName: "" };
  }

  openEditChannel(channel: Channel) {
    this.editChannel = { isOpen: true, channel };
  }

  closeEditChannel() {
    this.editChannel = { isOpen: false, channel: null };
  }

  openBrowseChannels() {
    this.browseChannels = { isOpen: true };
  }

  closeBrowseChannels() {
    this.browseChannels = { isOpen: false };
  }
}

export function useChannelModals() {
  return new ChannelModals();
}
