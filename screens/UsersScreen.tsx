"use client"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { collection, addDoc, query, where, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { useChat } from "../context/ChatContext"
import { useAuth } from "../context/AuthContext"

export default function UsersScreen({ navigation }) {
  const { users } = useChat()
  const { user } = useAuth()

  const startChat = async (otherUser) => {
    try {
      // Check if chat already exists
      const chatsRef = collection(db, "chats")
      const q = query(chatsRef, where("participants", "array-contains", user.uid))

      const querySnapshot = await getDocs(q)
      let existingChat = null

      querySnapshot.forEach((doc) => {
        const chatData = doc.data()
        if (chatData.participants.includes(otherUser.uid)) {
          existingChat = { id: doc.id, ...chatData }
        }
      })

      if (existingChat) {
        navigation.navigate("Chat", {
          chatId: existingChat.id,
          otherUser: otherUser,
        })
      } else {
        // Create new chat
        const newChat = {
          participants: [user.uid, otherUser.uid],
          participantDetails: [
            {
              uid: user.uid,
              displayName: user.displayName,
              photoURL: user.photoURL,
            },
            {
              uid: otherUser.uid,
              displayName: otherUser.displayName,
              photoURL: otherUser.photoURL,
            },
          ],
          lastMessage: "",
          lastMessageTime: new Date(),
          createdAt: new Date(),
        }

        const docRef = await addDoc(collection(db, "chats"), newChat)

        navigation.navigate("Chat", {
          chatId: docRef.id,
          otherUser: otherUser,
        })
      }
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  const renderUserItem = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => startChat(item)}>
      <View style={styles.avatarContainer}>
        {item.photoURL ? (
          <Image source={{ uri: item.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color="#666" />
          </View>
        )}
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={styles.userStatus}>{item.isOnline ? "Online" : "Offline"}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users</Text>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.uid}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 14,
    color: "#666",
  },
})
