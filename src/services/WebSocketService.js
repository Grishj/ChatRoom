/**
 * WebSocketService - Manages WebSocket connection and message handling
 * This service acts as a singleton to maintain a single WebSocket connection
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.messageHandlers = [];
    this.typingHandlers = [];
    this.connectionHandlers = [];
    this.reconnectInterval = 5000;
    this.shouldReconnect = true;
    this.userId = null;
    this.username = null;
  }

  /**
   * Initialize WebSocket connection
   * @param {string} url - WebSocket server URL
   * @param {string} userId - Current user's ID
   * @param {string} username - Current user's name
   */
  connect(url, userId, username) {
    this.userId = userId;
    this.username = username;
    this.shouldReconnect = true;

    try {
      // Create WebSocket connection
      this.ws = new WebSocket(url);

      // Connection opened
      this.ws.onopen = () => {
        console.log("WebSocket Connected");

        // Send user identification
        this.send({
          type: "USER_CONNECTED",
          userId: this.userId,
          username: this.username,
          timestamp: new Date().toISOString(),
        });

        // Notify connection handlers
        this.connectionHandlers.forEach((handler) => handler(true));
      };

      // Listen for messages
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      // Connection closed
      this.ws.onclose = () => {
        console.log("WebSocket Disconnected");
        this.connectionHandlers.forEach((handler) => handler(false));

        // Attempt reconnection if needed
        if (this.shouldReconnect) {
          setTimeout(
            () => this.connect(url, userId, username),
            this.reconnectInterval
          );
        }
      };

      // Handle errors
      this.ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };
    } catch (error) {
      console.error("Connection error:", error);
    }
  }

  /**
   * Handle incoming messages based on type
   */
  handleMessage(data) {
    switch (data.type) {
      case "MESSAGE":
        this.messageHandlers.forEach((handler) => handler(data));
        break;
      case "TYPING":
        this.typingHandlers.forEach((handler) => handler(data));
        break;
      case "STOP_TYPING":
        this.typingHandlers.forEach((handler) =>
          handler({ ...data, isTyping: false })
        );
        break;
      default:
        console.log("Unknown message type:", data.type);
    }
  }

  /**
   * Send message through WebSocket
   */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket is not connected");
    }
  }

  /**
   * Send chat message
   */
  sendMessage(text) {
    const message = {
      type: "MESSAGE",
      id: Date.now().toString(),
      text,
      userId: this.userId,
      username: this.username,
      timestamp: new Date().toISOString(),
    };
    this.send(message);
    return message;
  }

  /**
   * Send typing indicator
   */
  sendTyping() {
    this.send({
      type: "TYPING",
      userId: this.userId,
      username: this.username,
    });
  }

  /**
   * Stop typing indicator
   */
  stopTyping() {
    this.send({
      type: "STOP_TYPING",
      userId: this.userId,
      username: this.username,
    });
  }

  /**
   * Subscribe to messages
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Subscribe to typing events
   */
  onTyping(handler) {
    this.typingHandlers.push(handler);
    return () => {
      this.typingHandlers = this.typingHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Subscribe to connection status
   */
  onConnectionChange(handler) {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(
        (h) => h !== handler
      );
    };
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
    }
  }
}

export default new WebSocketService();
