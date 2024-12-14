import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  addMessage,
  sendMessage,
} from "../store/slices/chatSlice";
import { AppDispatch, RootState } from "../store";
import { io, Socket } from "socket.io-client";

export interface ChatRoomProps {
  roomId: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { messages } = useSelector((state: RootState) => state.chat);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (roomId) {
      dispatch(fetchMessages(roomId));
    }
  }, [roomId, dispatch]);

  useEffect(() => {
    if (roomId && user && token) {
      const newSocket = io("https://real-time-chat-app-6vra.onrender.com", {
        query: { token },
      });

      newSocket.emit("joinRoom", { roomId, userId: user.id });

      newSocket.on("newMessage", (newMessage) => {
        dispatch(addMessage(newMessage));
      });

      setSocket(newSocket);

      return () => {
        newSocket.emit("leaveRoom", {
          roomId,
          userId: user.id,
        });
        newSocket.disconnect();
      };
    }
  }, [roomId, user, token, dispatch]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && roomId && user) {
      dispatch(sendMessage({ roomId, text: message }));
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender.id === user?.id?.toString()
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.sender.id === user?.id?.toString()
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              <p className="font-bold">{msg.sender.username}</p>
              <p>{msg.text}</p>
              <p className="text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
