"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, serverTimestamp } from "firebase/firestore"
import { ArrowLeft, Send, Camera } from "lucide-react"
import { db } from "../config/firebase"
import { useAuth } from "../context/AuthContext"
import { formatTime } from "../utils/formatTime"

interface ChatScreenProps {
  chatData: any
  onNavigate: (screen: string) => void
}

export function ChatScreen({ chatData, onNavigate }: ChatScreenProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { chatId, otherUser } = chatData || {}

  useEffect(() => {
    if (!chatId) return

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
  }, [chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || loading) return

    setLoading(true)
    try {
      const messagesRef = collection(db, "chats", chatId, "messages")
      const messageData = {
        text: inputText.trim(),
        senderId: user?.uid,
        senderName: user?.displayName,
        timestamp: serverTimestamp(),
      }

      await addDoc(messagesRef, messageData)

      // Update chat's last message
      const chatRef = doc(db, "chats", chatId)
      await updateDoc(chatRef, {
        lastMessage: inputText.trim(),
        lastMessageTime: serverTimestamp(),
      })

      setInputText("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
        <button onClick={() => onNavigate("chats")} className="text-blue-600">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">{otherUser?.displayName?.charAt(0) || "?"}</span>
            </div>
            {otherUser?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{otherUser?.displayName}</h2>
            <p className="text-xs text-gray-500">{otherUser?.isOnline ? "Online" : "Offline"}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: any) => {
          const isMyMessage = message.senderId === user?.uid
          return (
            <div key={message.id} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  isMyMessage ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${isMyMessage ? "text-blue-100" : "text-gray-500"}`}>
                  {formatTime(message.timestamp?.toDate())}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button type="button" className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
            <Camera size={20} />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}
