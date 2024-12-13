import React, { useEffect, useState } from "react";
import { fetchChatRooms } from "../../utils/api";
import { Link } from "react-router-dom";

const ChatList = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const getChatRooms = async () => {
      try {
        const response = await fetchChatRooms();
        setRooms(response.data); // Save rooms to state
      } catch (error) {
        console.error("Failed to fetch chat rooms:", error.message);
      }
    };
    getChatRooms();
  }, []);

  return (
    <div className="h-screen bg-gray-100">
      <div className="bg-green-500 p-4 text-white font-bold text-lg">
        Chat Rooms
      </div>
      <ul className="divide-y divide-gray-200">
        {rooms.map((room) => (
          <li key={room._id} className="hover:bg-gray-200">
            <Link
              to={`/chatroom/${room._id}`}
              className="block px-4 py-3 text-gray-800"
            >
              {room.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
