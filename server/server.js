const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();

console.log("🚀 WebSocket server starting...");

wss.on("connection", (ws) => {
  console.log("✅ New client connected");

  // Assign a unique ID to this connection
  ws.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(
        "📨 Received:",
        message.type,
        "from",
        message.username || "unknown"
      );

      // Store client info
      if (message.type === "USER_CONNECTED") {
        clients.set(ws, {
          userId: message.userId,
          username: message.username,
          wsId: ws.id,
        });
        console.log(`👤 User connected: ${message.username}`);
      }

      // Broadcast message to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          // Option 1: Send to everyone (including sender)
          client.send(data.toString());

          // Option 2: Don't send back to sender (uncomment this and comment above)
          // if (client.id !== ws.id) {
          //   client.send(data.toString());
          // }
        }
      });
    } catch (error) {
      console.error("❌ Error processing message:", error);
    }
  });

  ws.on("close", () => {
    const clientInfo = clients.get(ws);
    if (clientInfo) {
      console.log(`👋 User disconnected: ${clientInfo.username}`);
    }
    clients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("❌ WebSocket error:", error);
  });
});

console.log("✅ WebSocket server running on ws://localhost:8080");
console.log("📝 Waiting for connections...");
