import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getChatRooms,
  getChatRoomMessages,
  sendMessageToChatRoom,
  createChatRoom,
} from "../services/chatService";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const socket = io("https://real-time-chat-app-6vra.onrender.com");

const Dashboard = () => {
  const { token, user, logout } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const fetchChatRooms = async () => {
      if (token) {
        const rooms = await getChatRooms(token);
        setChatRooms(rooms);
      }
    };
    fetchChatRooms();

    socket.on("newMessage", (message) => {
      if (message.room === selectedRoom?._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.disconnect();
  }, [token, selectedRoom]);

  const loadMessages = async (room) => {
    setSelectedRoom(room);
    const roomMessages = await getChatRoomMessages(token, room._id);
    setMessages(roomMessages);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const result = await sendMessageToChatRoom(
        token,
        selectedRoom._id,
        newMessage
      );
      if (result) {
        socket.emit("sendMessage", result);
        setMessages([...messages, result]);
        setNewMessage("");
      }
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      toast.error("Room name is required");
      return;
    }
    const room = await createChatRoom(token, newRoomName);
    if (room) {
      toast.success("Chat room created");
      setChatRooms([...chatRooms, room]);
      setNewRoomName("");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Chat Rooms</h2>
          <button
            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
            onClick={() => setShowProfile((prev) => !prev)}
          >
            Profile
          </button>
        </div>

        {showProfile ? (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <h3 className="font-bold">User Profile</h3>
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <button
              onClick={logout}
              className="bg-red-500 text-white py-1 px-3 mt-4 rounded"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            {/* Only admins can create rooms */}
            {user.role === "admin" && (
              <div className="p-4">
                <input
                  type="text"
                  placeholder="Room name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mb-2"
                />
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded w-full"
                  onClick={handleCreateRoom}
                >
                  Create Room
                </button>
              </div>
            )}

            <ul className="flex-1 overflow-y-auto">
              {chatRooms.map((room) => (
                <li
                  key={room._id}
                  onClick={() => loadMessages(room)}
                  className={`p-3 cursor-pointer ${
                    selectedRoom?._id === room._id ? "bg-green-100" : ""
                  } hover:bg-green-50`}
                >
                  {room.name}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Right Column */}
      <div className="w-3/4 flex flex-col">
        {selectedRoom ? (
          <>
            <div className="bg-green-500 text-white p-4">
              <h3 className="text-lg font-bold">{selectedRoom.name}</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    msg.sender.username === user.username
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      msg.sender.username === user.username
                        ? "bg-green-200 text-gray-800"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <p className="font-bold text-sm">{msg.sender.username}</p>
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-xs text-gray-500 block mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-gray-200 flex items-center">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg p-2 mr-2"
              />
              <button
                onClick={handleSendMessage}
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat room to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
