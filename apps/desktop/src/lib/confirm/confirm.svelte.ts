/**
 * Confirmation dialog state management.
 * Use with ConfirmModal component.
 */

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: "danger" | "default";
  resolve: ((value: boolean) => void) | null;
}

class ConfirmManager {
  state = $state<ConfirmState>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
    resolve: null,
  });

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.state = {
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText ?? "Confirm",
        cancelText: options.cancelText ?? "Cancel",
        variant: options.variant ?? "default",
        resolve,
      };
    });
  }

  handleConfirm() {
    this.state.resolve?.(true);
    this.state = { ...this.state, isOpen: false, resolve: null };
  }

  handleCancel() {
    this.state.resolve?.(false);
    this.state = { ...this.state, isOpen: false, resolve: null };
  }
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
}

export const confirmManager = new ConfirmManager();

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return confirmManager.confirm(options);
}
