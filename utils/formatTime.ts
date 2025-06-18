export const formatTime = (date) => {
  if (!date) return ""

  const now = new Date()
  const messageDate = new Date(date)
  const diffInHours = (now - messageDate) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  } else if (diffInHours < 24) {
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  } else if (diffInHours < 48) {
    return "Yesterday"
  } else {
    return messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })
  }
}
