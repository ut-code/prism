import { useOrganizationData, useOrganizationMutations } from "./data-hooks.svelte.ts";
import { searchAndAddMember } from "./member-utils.ts";

/**
 * Controller for organization settings page.
 * Handles UI state management and coordinates data operations.
 */
export class SettingsController {
  organizationId: () => string;
  api;
  organization;
  members;
  updateOrganization;
  removeMember;

  isEditing = $state(false);
  editForm = $state({
    name: "",
    description: "",
  });

  constructor(organizationId: () => string) {
    this.organizationId = organizationId;

    const { organization, members, api } = useOrganizationData(organizationId);
    this.organization = organization;
    this.members = members;
    this.api = api;

    const { updateOrganization, removeMember } = useOrganizationMutations();
    this.updateOrganization = updateOrganization;
    this.removeMember = removeMember;

    $effect(() => {
      if (this.organization.data) {
        this.editForm.name = this.organization.data.name;
        this.editForm.description = this.organization.data.description || "";
      }
    });
  }

  async handleUpdate() {
    try {
      console.log("Updating organization...", $state.snapshot(this.editForm));
      await this.updateOrganization.run({
        id: this.organizationId(),
        name: this.editForm.name,
        description: this.editForm.description,
      });
      this.isEditing = false;
    } catch (error) {
      console.error("Failed to update organization:", error);
    }
  }

  async handleRemoveMember(userId: string) {
    if (confirm("このメンバーを削除しますか？")) {
      try {
        await this.removeMember.run({
          organizationId: this.organizationId(),
          userId,
        });
      } catch (error) {
        console.error("Failed to remove member:", error);
      }
    }
  }

  async addMember() {
    await searchAndAddMember(
      this.api,
      this.organizationId(),
      this.members.data,
    );
  }
}
