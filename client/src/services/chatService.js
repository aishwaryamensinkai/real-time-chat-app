const API_BASE_URL =
  "https://real-time-chat-app-6vra.onrender.com/api/chatroom";

// Admin User Functions
export const getChatRooms = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch chat rooms");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching chat rooms:", error.message);
    return [];
  }
};

export const createChatRoom = async (token, name, isPrivate = false) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, is_private: isPrivate }),
    });

    if (!response.ok) {
      throw new Error("Failed to create chat room");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating chat room:", error.message);
    return null;
  }
};

export const deleteChatRoom = async (token, roomId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete/${roomId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to delete chat room");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting chat room:", error.message);
    return null;
  }
};

// Non-Admin User Functions
export const joinChatRoom = async (token, roomId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/join/${roomId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to join chat room");
    }

    return await response.json();
  } catch (error) {
    console.error("Error joining chat room:", error.message);
    return null;
  }
};

export const leaveChatRoom = async (token, roomId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/leave/${roomId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to leave chat room");
    }

    return await response.json();
  } catch (error) {
    console.error("Error leaving chat room:", error.message);
    return null;
  }
};

// Send a Message
export const sendMessageToChatRoom = async (token, roomId, text) => {
  try {
    const response = await fetch(`${API_BASE_URL}/message`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomId, text }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error.message);
    return null;
  }
};

// Get Chat History
export const getChatRoomMessages = async (token, roomId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/history/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch chat room messages");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching chat room messages:", error.message);
    return [];
  }
};
