"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "../config/firebase"
import { useAuth } from "../context/AuthContext"
import { formatTime } from "../utils/formatTime"

export default function ChatScreen({ route, navigation }) {
  const { chatId, otherUser } = route.params
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const flatListRef = useRef(null)

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitle}>
          <View style={styles.headerAvatar}>
            {otherUser?.photoURL ? (
              <Image source={{ uri: otherUser.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={20} color="#666" />
              </View>
            )}
          </View>
          <View>
            <Text style={styles.headerName}>{otherUser?.displayName}</Text>
            <Text style={styles.headerStatus}>{otherUser?.isOnline ? "Online" : "Offline"}</Text>
          </View>
        </View>
      ),
    })

    // Listen to messages
    const messagesRef = collection(db, "chats", chatId, "messages")
    const q = query(messagesRef, orderBy("timestamp", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setMessages(messageList)
    })

    return unsubscribe
  }, [chatId, otherUser, navigation])

  const sendMessage = async (text, imageUrl = null) => {
    if (!text.trim() && !imageUrl) return

    try {
      const messagesRef = collection(db, "chats", chatId, "messages")
      const messageData = {
        text: text.trim(),
        imageUrl: imageUrl,
        senderId: user.uid,
        senderName: user.displayName,
        timestamp: serverTimestamp(),
      }

      await addDoc(messagesRef, messageData)

      // Update chat's last message
      const chatRef = doc(db, "chats", chatId)
      await updateDoc(chatRef, {
        lastMessage: imageUrl ? "📷 Photo" : text.trim(),
        lastMessageTime: serverTimestamp(),
      })

      setInputText("")
    } catch (error) {
      console.error("Error sending message:", error)
      Alert.alert("Error", "Failed to send message")
    }
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera roll permissions")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    })

    if (!result.canceled) {
      uploadImage(result.assets[0].uri)
    }
  }

  const uploadImage = async (uri) => {
    setLoading(true)
    try {
      const response = await fetch(uri)
      const blob = await response.blob()

      const imageRef = ref(storage, `chat-images/${Date.now()}`)
      await uploadBytes(imageRef, blob)

      const downloadURL = await getDownloadURL(imageRef)
      await sendMessage("", downloadURL)
    } catch (error) {
      console.error("Error uploading image:", error)
      Alert.alert("Error", "Failed to upload image")
    }
    setLoading(false)
  }

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === user.uid

    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
        ) : (
          <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.otherMessageText]}>
            {item.text}
          </Text>
        )}
        <Text style={[styles.messageTime, isMyMessage ? styles.myMessageTime : styles.otherMessageTime]}>
          {formatTime(item.timestamp?.toDate())}
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage} disabled={loading}>
            <Ionicons name="camera" size={24} color="#007AFF" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && !loading && styles.sendButtonDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    marginRight: 10,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  avatarPlaceholder: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  headerStatus: {
    fontSize: 12,
    color: "#666",
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 4,
    padding: 12,
    borderRadius: 18,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#333",
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },
  otherMessageTime: {
    color: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  imageButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    padding: 10,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
})
