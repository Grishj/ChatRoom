import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import { useChat } from "../context/ChatContext";
import { SafeAreaView } from "react-native-safe-area-context";
const ChatScreen = ({ route }) => {
  const { username } = route.params;
  const {
    messages,
    typingUsers,
    isConnected,
    currentUser,
    connectChat,
    sendMessage,
    startTyping,
    stopTyping,
  } = useChat();

  useEffect(() => {
    // Connect to chat when screen loads
    connectChat(username);
  }, [username, connectChat]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat Room</Text>
        <View
          style={[
            styles.connectionIndicator,
            isConnected ? styles.connected : styles.disconnected,
          ]}
        />
      </View>

      <MessageList
        messages={messages}
        currentUserId={currentUser?.id}
        typingUsers={typingUsers}
      />

      <MessageInput
        onSend={sendMessage}
        onTyping={startTyping}
        onStopTyping={stopTyping}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connected: {
    backgroundColor: "#4CD964",
  },
  disconnected: {
    backgroundColor: "#FF3B30",
  },
});

export default ChatScreen;
