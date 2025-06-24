"use client"

import { useState } from "react"
import { LoginScreen } from "./LoginScreen"
import { SignupScreen } from "./SignupScreen"
import { ChatListScreen } from "./ChatListScreen"
import { UsersScreen } from "./UsersScreen"
import { SettingsScreen } from "./SettingsScreen"
import { ChatScreen } from "./ChatScreen"
import { MessageCircle, Users, Settings } from "lucide-react"

type Screen = "login" | "signup" | "chats" | "users" | "settings" | "chat"

interface MessengerAppProps {
  user: any
}

export function MessengerApp({ user }: MessengerAppProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>(user ? "chats" : "login")
  const [chatData, setChatData] = useState<any>(null)

  const navigate = (screen: Screen, data?: any) => {
    setCurrentScreen(screen)
    if (data) setChatData(data)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {currentScreen === "login" && <LoginScreen onNavigate={navigate} />}
        {currentScreen === "signup" && <SignupScreen onNavigate={navigate} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {currentScreen === "chat" ? (
        <ChatScreen chatData={chatData} onNavigate={navigate} />
      ) : (
        <>
          {/* Main Content */}
          <div className="pb-16">
            {currentScreen === "chats" && <ChatListScreen onNavigate={navigate} />}
            {currentScreen === "users" && <UsersScreen onNavigate={navigate} />}
            {currentScreen === "settings" && <SettingsScreen onNavigate={navigate} />}
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
            <div className="flex">
              <button
                onClick={() => navigate("chats")}
                className={`flex-1 py-3 px-4 flex flex-col items-center space-y-1 ${
                  currentScreen === "chats" ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <MessageCircle size={24} />
                <span className="text-xs">Chats</span>
              </button>
              <button
                onClick={() => navigate("users")}
                className={`flex-1 py-3 px-4 flex flex-col items-center space-y-1 ${
                  currentScreen === "users" ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <Users size={24} />
                <span className="text-xs">Users</span>
              </button>
              <button
                onClick={() => navigate("settings")}
                className={`flex-1 py-3 px-4 flex flex-col items-center space-y-1 ${
                  currentScreen === "settings" ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <Settings size={24} />
                <span className="text-xs">Settings</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
