import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../index";

// Interfaces
interface User {
  _id: string;
  username: string;
}

interface ChatRoom {
  _id: string;
  name: string;
  is_private: boolean;
  created_by: string;
  participants: string[];
}

interface Message {
  _id: string;
  text: string;
  sender: User;
  room: string;
  timestamp: string;
  type: "user" | "system";
}
interface Notification {
  message: string;
  timestamp: string;
}

interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  activeUsers: number;
  notifications: Notification[];
}

// Initial state
const initialState: ChatState = {
  rooms: [],
  currentRoom: null,
  messages: [],
  isLoading: false,
  error: null,
  activeUsers: 0,
  notifications: [],
};

// Async thunks
export const fetchRooms = createAsyncThunk(
  "chat/fetchRooms",
  async (_, { getState, rejectWithValue }) => {
    try {
      // console.log("Fetching rooms...");
      const { auth } = getState() as { auth: { token: string } };
      const response = await axios.get(
        "https://real-time-chat-app-6vra.onrender.com/api/chatroom",
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      // console.log("Rooms fetched successfully:", response.data);
      return response.data;
    } catch (error: any) {
      // console.error("Error fetching rooms:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch rooms"
      );
    }
  }
);

export const createRoom = createAsyncThunk(
  "chat/createRoom",
  async (
    roomData: { name: string; is_private: boolean },
    { getState, rejectWithValue }
  ) => {
    try {
      // console.log("Creating room with data:", roomData);
      const { auth } = getState() as { auth: { token: string } };
      const response = await axios.post(
        "https://real-time-chat-app-6vra.onrender.com/api/chatroom/create",
        roomData,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      // console.log("Room created successfully:", response.data.chatRoom);
      return response.data.chatRoom;
    } catch (error: any) {
      console.error("Error creating room:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to create room"
      );
    }
  }
);

export const joinRoom = createAsyncThunk(
  "chat/joinRoom",
  async (roomId: string, { getState, dispatch }) => {
    try {
      const { auth } = getState() as {
        auth: { token: string; user: { _id: string; username: string } };
      };
      const response = await axios.post(
        `https://real-time-chat-app-6vra.onrender.com/api/chatroom/join/${roomId}`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      // Add notification for all users
      dispatch(
        addNotification({
          message: `${auth.user.username} has joined the room "${response.data.chatRoom.name}"`,
          timestamp: new Date().toISOString(),
        })
      );

      return response.data.chatRoom;
    } catch (error: any) {
      console.error("Error joining room:", error);
      throw error;
    }
  }
);

export const leaveRoom = createAsyncThunk(
  "chat/leaveRoom",
  async (roomId: string, { getState, dispatch }) => {
    try {
      const { auth } = getState() as {
        auth: { token: string; user: { _id: string; username: string } };
      };
      const response = await axios.post(
        `https://real-time-chat-app-6vra.onrender.com/api/chatroom/leave/${roomId}`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      // Add notification for all users
      dispatch(
        addNotification({
          message: `${auth.user.username} has left the room "${response.data.chatRoom.name}"`,
          timestamp: new Date().toISOString(),
        })
      );

      return response.data;
    } catch (error: any) {
      console.error("Error leaving room:", error);
      throw error;
    }
  }
);

export const deleteRoom = createAsyncThunk(
  "chat/deleteRoom",
  async (roomId: string, { getState, dispatch }) => {
    try {
      const { auth } = getState() as {
        auth: { token: string; user: { username: string } };
      };
      const response = await axios.delete(
        `https://real-time-chat-app-6vra.onrender.com/api/chatroom/delete/${roomId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      // Add notification for all users
      dispatch(
        addNotification({
          message: `${auth.user.username} has deleted the room "${response.data.name}"`,
          timestamp: new Date().toISOString(),
        })
      );

      return response.data;
    } catch (error: any) {
      console.error("Error deleting room:", error);
      throw error;
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (roomId: string, { getState, rejectWithValue }) => {
    try {
      // console.log("Fetching messages for room ID:", roomId);
      const { auth } = getState() as { auth: { token: string } };
      const response = await axios.get(
        `https://real-time-chat-app-6vra.onrender.com/api/chatroom/history/${roomId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      // console.log("Messages fetched successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    { roomId, text }: { roomId: string; text: string },
    { getState, rejectWithValue }
  ) => {
    try {
      // console.log("Sending message to room ID:", roomId);
      if (!roomId || !text) {
        throw new Error("Room ID and message text are required");
      }
      const { auth } = getState() as {
        auth: { token: string; user: { _id: string } };
      };
      const response = await axios.post(
        "https://real-time-chat-app-6vra.onrender.com/api/chatroom/message",
        { roomId, userId: auth.user._id, text },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      // console.log("Message sent successfully:", response.data.message);
      return response.data.message;
    } catch (error: any) {
      console.error("Error sending message:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to send message"
      );
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentRoom: (state, action: PayloadAction<ChatRoom | null>) => {
      console.log("Setting current room:", action.payload);
      state.currentRoom = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      console.log("Adding new message:", action.payload);
      state.messages.push(action.payload);
    },
    addSystemMessage: (
      state,
      action: PayloadAction<{ text: string; timestamp: string }>
    ) => {
      console.log("Adding new system message:", action.payload);
      state.messages.push({
        _id: Date.now().toString(),
        sender: { _id: "system", username: "System" },
        text: action.payload.text,
        room: state.currentRoom?._id || "",
        timestamp: action.payload.timestamp,
        type: "system",
      });
    },
    setActiveUsers: (state, action: PayloadAction<number>) => {
      state.activeUsers = action.payload;
    },
    clearMessages: (state) => {
      console.log("Clearing all messages");
      state.messages = [];
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        // console.log("fetchRooms: pending");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        // console.log("fetchRooms: fulfilled", action.payload);
        state.isLoading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        // console.log("fetchRooms: rejected", action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        // console.log("createRoom: fulfilled", action.payload);
        state.rooms.push(action.payload);
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        // console.log("joinRoom: fulfilled", action.payload);
        if (action.payload && action.payload._id) {
          state.currentRoom = action.payload;
          const roomIndex = state.rooms.findIndex(
            (room) => room._id === action.payload._id
          );
          if (roomIndex !== -1) {
            state.rooms[roomIndex] = action.payload;
          } else {
            state.rooms.push(action.payload);
          }
        }
      })
      .addCase(leaveRoom.fulfilled, (state, action) => {
        // console.log("leaveRoom: fulfilled", action.payload);
        state.currentRoom = null;
        if (
          action.payload &&
          action.payload.chatRoom &&
          action.payload.chatRoom._id
        ) {
          state.rooms = state.rooms.map((room) =>
            room._id === action.payload.chatRoom._id
              ? action.payload.chatRoom
              : room
          );
        }
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        console.log("deleteRoom: fulfilled", action.payload);
        if (state.currentRoom && state.currentRoom._id === action.payload._id) {
          state.currentRoom = null;
        }
        state.rooms = state.rooms.filter(
          (room) => room._id !== action.payload._id
        );
      })
      .addCase(fetchMessages.pending, (state) => {
        // console.log("fetchMessages: pending");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        // console.log("fetchMessages: fulfilled", action.payload);
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        // console.log("fetchMessages: rejected", action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        // console.log("sendMessage: fulfilled", action.payload);
        state.messages.push(action.payload);
      });
  },
});

// Actions
export const {
  setCurrentRoom,
  addMessage,
  addSystemMessage,
  clearMessages,
  setActiveUsers,
  addNotification,
  clearNotifications,
} = chatSlice.actions;

// Selectors
export const selectRooms = (state: RootState) => state.chat.rooms;
export const selectCurrentRoom = (state: RootState) => state.chat.currentRoom;
export const selectMessages = (state: RootState) => state.chat.messages;
export const selectIsLoading = (state: RootState) => state.chat.isLoading;
export const selectError = (state: RootState) => state.chat.error;
export const selectActiveUsers = (state: RootState) => state.chat.activeUsers;
export const selectNotifications = (state: RootState) =>
  state.chat.notifications;

// Reducer
export default chatSlice.reducer;
