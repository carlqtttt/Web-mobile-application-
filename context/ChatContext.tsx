"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore"
import { db } from "../config/firebase"
import { useAuth } from "./AuthContext"

interface ChatContextType {
  chats: any[]
  users: any[]
  loading: boolean
}

const ChatContext = createContext<ChatContextType>({
  chats: [],
  users: [],
  loading: true,
})

export const useChat = () => useContext(ChatContext)

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chats, setChats] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // Listen to chats
      const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid),
        orderBy("lastMessageTime", "desc"),
      )

      const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
        const chatList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setChats(chatList)
      })

      // Listen to users
      const usersQuery = query(collection(db, "users"))
      const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const userList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((u) => u.uid !== user.uid)
        setUsers(userList)
        setLoading(false)
      })

      return () => {
        unsubscribeChats()
        unsubscribeUsers()
      }
    } catch (error) {
      console.error("Error setting up chat listeners:", error)
      setLoading(false)
    }
  }, [user])

  return <ChatContext.Provider value={{ chats, users, loading }}>{children}</ChatContext.Provider>
}
