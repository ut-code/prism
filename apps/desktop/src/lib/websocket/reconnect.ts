/**
 * Handles automatic reconnection logic with exponential backoff.
 */
export class ReconnectManager {
  private attempts = 0;
  private maxAttempts = 5;
  private baseDelay = 1000;

  /**
   * Attempts to reconnect with exponential backoff.
   * Returns true if reconnect should be attempted.
   */
  shouldReconnect(): boolean {
    return this.attempts < this.maxAttempts;
  }

  /**
   * Schedules a reconnection attempt.
   */
  scheduleReconnect(callback: () => void) {
    if (!this.shouldReconnect()) return;

    this.attempts++;
    const delay = this.baseDelay * this.attempts;

    setTimeout(() => {
      callback();
    }, delay);
  }

  /**
   * Resets the reconnection state.
   */
  reset() {
    this.attempts = 0;
  }
}
