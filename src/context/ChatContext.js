import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import WebSocketService from "../services/WebSocketService";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Initialize WebSocket connection
  const connectChat = useCallback((username) => {
    const userId = `user_${Date.now()}`;
    setCurrentUser({ id: userId, name: username });

    // Replace with your WebSocket server URL
    WebSocketService.connect("ws://192.168.18.18:8080", userId, username);
  }, []);

  // Send message
  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;

    const message = WebSocketService.sendMessage(text);
    // Add message to local state immediately for better UX
    setMessages((prev) => [...prev, message]);
  }, []);

  // Handle typing
  const startTyping = useCallback(() => {
    WebSocketService.sendTyping();
  }, []);

  const stopTyping = useCallback(() => {
    WebSocketService.stopTyping();
  }, []);

  useEffect(() => {
    // Subscribe to WebSocket events
    const unsubscribeMessage = WebSocketService.onMessage((message) => {
      // Don't duplicate messages from current user
      if (message.userId !== currentUser?.id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    const unsubscribeTyping = WebSocketService.onTyping((data) => {
      if (data.userId !== currentUser?.id) {
        if (data.isTyping === false) {
          setTypingUsers((prev) =>
            prev.filter((u) => u.userId !== data.userId)
          );
        } else {
          setTypingUsers((prev) => {
            const exists = prev.find((u) => u.userId === data.userId);
            if (!exists) {
              return [
                ...prev,
                { userId: data.userId, username: data.username },
              ];
            }
            return prev;
          });

          // Auto-remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers((prev) =>
              prev.filter((u) => u.userId !== data.userId)
            );
          }, 3000);
        }
      }
    });

    const unsubscribeConnection =
      WebSocketService.onConnectionChange(setIsConnected);

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeConnection();
    };
  }, [currentUser]);

  const value = {
    messages,
    typingUsers,
    isConnected,
    currentUser,
    connectChat,
    sendMessage,
    startTyping,
    stopTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
