import React, { useRef, useEffect } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";

/**
 * MessageList - Scrollable list of messages with auto-scroll to bottom
 */
const MessageList = ({ messages, currentUserId, typingUsers }) => {
  const flatListRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item }) => (
    <ChatBubble message={item} isOwnMessage={item.userId === currentUserId} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        ListFooterComponent={<TypingIndicator typingUsers={typingUsers} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  messageList: {
    paddingVertical: 10,
  },
});

export default MessageList;
