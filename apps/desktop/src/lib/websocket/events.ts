import type { WsEvent } from "./types.ts";

/**
 * Manages event listeners for WebSocket events.
 */
export class EventManager {
  private listeners = new Map<string, Set<(event: WsEvent) => void>>();

  /**
   * Adds an event listener.
   */
  on(eventType: string, callback: (event: WsEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)?.add(callback);
  }

  /**
   * Removes an event listener.
   */
  off(eventType: string, callback: (event: WsEvent) => void) {
    this.listeners.get(eventType)?.delete(callback);
  }

  /**
   * Notifies all listeners for a given event.
   */
  notify(event: WsEvent) {
    const eventListeners = this.listeners.get(event.type);
    if (eventListeners) {
      for (const callback of eventListeners) {
        callback(event);
      }
    }
  }
}
