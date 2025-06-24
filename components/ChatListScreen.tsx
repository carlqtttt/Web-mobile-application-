"use client"

import { MessageCircle } from "lucide-react"
import { useChat } from "../context/ChatContext"
import { useAuth } from "../context/AuthContext"
import { formatTime } from "../utils/formatTime"

interface ChatListScreenProps {
  onNavigate: (screen: string, data?: any) => void
}

export function ChatListScreen({ onNavigate }: ChatListScreenProps) {
  const { chats } = useChat()
  const { user } = useAuth()

  const handleChatClick = (chat: any) => {
    const otherParticipant = chat.participantDetails?.find((p: any) => p.uid !== user?.uid)
    onNavigate("chat", {
      chatId: chat.id,
      otherUser: otherParticipant,
    })
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
      </div>

      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <MessageCircle size={64} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No chats yet</h3>
          <p className="text-gray-500 text-center">Start a conversation from the Users tab</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {chats.map((chat) => {
            const otherParticipant = chat.participantDetails?.find((p: any) => p.uid !== user?.uid)
            return (
              <div key={chat.id} onClick={() => handleChatClick(chat)} className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {otherParticipant?.displayName?.charAt(0) || "?"}
                      </span>
                    </div>
                    {otherParticipant?.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {otherParticipant?.displayName || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500">{formatTime(chat.lastMessageTime?.toDate())}</p>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage || "No messages yet"}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
