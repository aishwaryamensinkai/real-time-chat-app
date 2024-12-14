import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRooms,
  createRoom,
  joinRoom,
} from "../store/slices/chatSlice";
import { logout } from "../store/slices/authSlice";
import { AppDispatch, RootState } from "../store";
import ChatRoom from "./ChatRoom";

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { rooms, currentRoom } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  const handleCreateRoom = () => {
    const roomName = prompt("Enter room name:");
    if (roomName) {
      dispatch(createRoom({ name: roomName, is_private: false }));
    }
  };

  const handleJoinRoom = (roomId: string) => {
    dispatch(joinRoom(roomId));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-100 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Chat Rooms</h2>
        <ul className="space-y-2">
          {rooms.map((room) => (
            <li
              key={room.id}
              className={`cursor-pointer p-2 rounded ${
                currentRoom?.id === room.id
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => handleJoinRoom(room.id)}
            >
              {room.name}
            </li>
          ))}
        </ul>
        {user?.role === "Admin" && (
          <button
            onClick={handleCreateRoom}
            className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Room
          </button>
        )}
        <button
          onClick={handleLogout}
          className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <div className="flex-1">
        <ChatRoom />
      </div>
    </div>
  );
};

export default Dashboard;
