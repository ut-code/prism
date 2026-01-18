/**
 * Simple toast notification system.
 */

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toasts = $state<Toast[]>([]);
let nextId = 0;

export function showToast(message: string, type: ToastType = "info") {
  const id = nextId++;
  toasts.push({ id, message, type });
  setTimeout(() => removeToast(id), 3000);
}

function removeToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
}

export function getToasts() {
  return toasts;
}
