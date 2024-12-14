import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface ChatRoom {
  id: string;
  name: string;
  is_private: boolean;
  created_by: string;
  participants: string[];
}

interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    username: string;
  };
  room: string;
  timestamp: string;
}

interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  rooms: [],
  currentRoom: null,
  messages: [],
  isLoading: false,
  error: null,
};

export const fetchRooms = createAsyncThunk(
  'chat/fetchRooms',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const response = await axios.get('https://real-time-chat-app-6vra.onrender.com/api/chatroom', {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const createRoom = createAsyncThunk(
  'chat/createRoom',
  async (roomData: { name: string; is_private: boolean }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const response = await axios.post('https://real-time-chat-app-6vra.onrender.com/api/chatroom/create', roomData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.chatRoom;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const joinRoom = createAsyncThunk(
  'chat/joinRoom',
  async (roomId: string, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const response = await axios.post(`https://real-time-chat-app-6vra.onrender.com/api/chatroom/join/${roomId}`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data.chatRoom;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (roomId: string, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const response = await axios.get(`https://real-time-chat-app-6vra.onrender.com/api/chatroom/history/${roomId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.currentRoom = action.payload;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentRoom, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
