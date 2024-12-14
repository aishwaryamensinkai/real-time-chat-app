import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  deleteRoom,
  setCurrentRoom,
} from "../store/slices/chatSlice";
import { logout } from "../store/slices/authSlice";
import { AppDispatch, RootState } from "../store";
import ChatRoom from "./ChatRoom";

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { rooms, currentRoom } = useSelector((state: RootState) => state.chat);
  const [newRoomName, setNewRoomName] = useState("");

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      dispatch(createRoom({ name: newRoomName, is_private: false }));
      setNewRoomName("");
    }
  };

  const handleJoinRoom = (roomId: string) => {
    if (roomId && typeof roomId === "string") {
      if (isUserInRoom(roomId)) {
        dispatch(setCurrentRoom(rooms.find((room) => room._id === roomId) || null));
      } else {
        dispatch(joinRoom(roomId));
      }
    }
  };

  const handleLeaveRoom = () => {
    if (currentRoom && currentRoom._id) {
      dispatch(leaveRoom(currentRoom._id));
    } else {
      console.error(
        "Attempted to leave room with invalid currentRoom:",
        currentRoom
      );
    }
  };

  const handleDeleteRoom = () => {
    if (currentRoom && currentRoom._id && user?.role === "Admin") {
      dispatch(deleteRoom(currentRoom._id));
    } else {
      console.error(
        "Attempted to delete room with invalid currentRoom or insufficient permissions:",
        currentRoom
      );
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const isUserInRoom = (roomId: string): boolean => {
    if (!user || !user.id || !roomId) return false;
    const room = rooms.find((room) => room._id === roomId);
    return room ? room.participants.includes(user.id.toString()) : false;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-100 p-4 border-r flex flex-col">
        <h2 className="text-xl font-bold mb-4">Chat Rooms</h2>
        <ul className="space-y-2 flex-grow overflow-y-auto">
          {rooms.map((room) => (
            <li
              key={room._id}
              className={`flex justify-between items-center p-2 rounded ${
                currentRoom?._id === room._id
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              <span
                className="cursor-pointer"
                onClick={() => handleJoinRoom(room._id)}
              >
                {room.name}
              </span>
              {!isUserInRoom(room._id) && (
                <button
                  onClick={() => handleJoinRoom(room._id)}
                  className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                >
                  Join
                </button>
              )}
            </li>
          ))}
        </ul>
        <form onSubmit={handleCreateRoom} className="mt-4">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="New room name"
            className="w-full px-3 py-2 border rounded-md"
          />
          <button
            type="submit"
            className="mt-2 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Room
          </button>
        </form>
        <button
          onClick={handleLogout}
          className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            <div className="bg-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{currentRoom.name}</h2>
              <div>
                <button
                  onClick={handleLeaveRoom}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                >
                  Leave Room
                </button>
                {user.role === "Admin" && (
                  <button
                    onClick={handleDeleteRoom}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete Room
                  </button>
                )}
              </div>
            </div>
            {currentRoom && isUserInRoom(currentRoom._id) ? (
              <ChatRoom roomId={currentRoom._id} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">
                  {currentRoom
                    ? "You are not a member of this room. Join to view messages."
                    : "Select a room to start chatting"}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a room to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

