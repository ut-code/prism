import { EventManager } from "./events.ts";
import { ReconnectManager } from "./reconnect.ts";
import type { ConnectionStatus, WsEvent } from "./types.ts";

/**
 * WebSocket client for real-time updates.
 * Manages connection, reconnection, and channel subscriptions.
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private eventManager = new EventManager();
  private reconnectManager = new ReconnectManager();

  status = $state<ConnectionStatus>("disconnected");
  subscribedChannels = $state<Set<string>>(new Set());

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Connects to the WebSocket server.
   */
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.status = "connecting";
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.status = "connected";
      this.reconnectManager.reset();
      this.resubscribeChannels();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WsEvent;
        this.eventManager.notify(data);
      } catch (error) {
        console.error("WebSocket message parse error:", error);
      }
    };

    this.ws.onerror = () => {
      this.status = "error";
    };

    this.ws.onclose = () => {
      this.status = "disconnected";
      this.reconnectManager.scheduleReconnect(() => this.connect());
    };
  }

  /**
   * Disconnects from the WebSocket server.
   */
  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.status = "disconnected";
  }

  /**
   * Subscribes to a channel.
   */
  subscribe(channelId: string) {
    this.subscribedChannels.add(channelId);
    this.send({ type: "subscribe", channelId });
  }

  /**
   * Unsubscribes from a channel.
   */
  unsubscribe(channelId: string) {
    this.subscribedChannels.delete(channelId);
    this.send({ type: "unsubscribe", channelId });
  }

  /**
   * Adds an event listener.
   */
  on(eventType: string, callback: (event: WsEvent) => void) {
    this.eventManager.on(eventType, callback);
  }

  private send(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private resubscribeChannels() {
    for (const channelId of this.subscribedChannels) {
      this.send({ type: "subscribe", channelId });
    }
  }
}
