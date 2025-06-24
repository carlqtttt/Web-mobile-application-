"use client"

import { collection, addDoc, query, where, getDocs } from "firebase/firestore"
import { ChevronRight } from "lucide-react"
import { db } from "../config/firebase"
import { useChat } from "../context/ChatContext"
import { useAuth } from "../context/AuthContext"

interface UsersScreenProps {
  onNavigate: (screen: string, data?: any) => void
}

export function UsersScreen({ onNavigate }: UsersScreenProps) {
  const { users } = useChat()
  const { user } = useAuth()

  const startChat = async (otherUser: any) => {
    try {
      // Check if chat already exists
      const chatsRef = collection(db, "chats")
      const q = query(chatsRef, where("participants", "array-contains", user?.uid))

      const querySnapshot = await getDocs(q)
      let existingChat = null

      querySnapshot.forEach((doc) => {
        const chatData = doc.data()
        if (chatData.participants.includes(otherUser.uid)) {
          existingChat = { id: doc.id, ...chatData }
        }
      })

      if (existingChat) {
        onNavigate("chat", {
          chatId: existingChat.id,
          otherUser: otherUser,
        })
      } else {
        // Create new chat
        const newChat = {
          participants: [user?.uid, otherUser.uid],
          participantDetails: [
            {
              uid: user?.uid,
              displayName: user?.displayName,
              photoURL: user?.photoURL,
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

        onNavigate("chat", {
          chatId: docRef.id,
          otherUser: otherUser,
        })
      }
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      </div>

      <div className="divide-y divide-gray-200">
        {users.map((userItem) => (
          <div key={userItem.uid} onClick={() => startChat(userItem)} className="p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">{userItem.displayName?.charAt(0) || "?"}</span>
                </div>
                {userItem.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userItem.displayName}</p>
                <p className="text-sm text-gray-500">{userItem.isOnline ? "Online" : "Offline"}</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
