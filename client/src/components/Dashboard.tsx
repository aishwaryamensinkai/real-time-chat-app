import React, { useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  deleteRoom,
  setCurrentRoom,
  addNotification,
} from "../store/slices/chatSlice";
import { logout } from "../store/slices/authSlice";
import { AppDispatch, RootState } from "../store";
import ChatRoom from "./ChatRoom";
import Notifications from "./Notifications";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";

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
    if (roomId && typeof roomId === "string" && isUserInRoom(roomId)) {
      dispatch(
        setCurrentRoom(rooms.find((room) => room._id === roomId) || null)
      );
    }
  };

  const handleJoinRequest = (roomId: string) => {
    if (roomId && typeof roomId === "string" && !isUserInRoom(roomId)) {
      dispatch(joinRoom(roomId)).then(() => {
        dispatch(
          setCurrentRoom(rooms.find((room) => room._id === roomId) || null)
        );
        dispatch(
          addNotification({
            message: `You joined ${
              rooms.find((room) => room._id === roomId)?.name
            }`,
            timestamp: new Date().toISOString(),
          })
        );
      });
    }
  };

  const handleLeaveRoom = (roomId: string) => {
    if (roomId) {
      dispatch(leaveRoom(roomId));
      if (currentRoom && currentRoom._id === roomId) {
        dispatch(setCurrentRoom(null));
      }
      dispatch(
        addNotification({
          message: `You left ${
            rooms.find((room) => room._id === roomId)?.name
          }`,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      console.error("Attempted to leave room with invalid roomId:", roomId);
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    if (roomId && user?.role === "Admin") {
      dispatch(deleteRoom(roomId));
      if (currentRoom && currentRoom._id === roomId) {
        dispatch(setCurrentRoom(null));
      }
    } else {
      console.error(
        "Attempted to delete room with invalid roomId or insufficient permissions:",
        roomId
      );
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const isUserInRoom = (roomId: string): boolean => {
    if (!user || !user._id || !roomId) return false;
    const room = rooms.find((room) => room._id === roomId);
    return room ? room.participants.includes(user._id.toString()) : false;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-100 p-4 border-r flex flex-col">
        <h2 className="text-xl font-bold mb-4">Chat Rooms</h2>
        <Notifications />
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
                className={`cursor-pointer flex-grow ${
                  isUserInRoom(room._id) ? "font-semibold" : "text-gray-500"
                }`}
                onClick={() => handleJoinRoom(room._id)}
              >
                {room.name}
              </span>
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex w-full justify-center rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                    <EllipsisVerticalIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1">
                      {!isUserInRoom(room._id) ? (
                        <>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={`${
                                  active
                                    ? "bg-blue-500 text-white"
                                    : "text-gray-900"
                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                onClick={() => handleJoinRequest(room._id)}
                              >
                                Join
                              </button>
                            )}
                          </Menu.Item>
                          {user.role === "Admin" && (
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  className={`${
                                    active
                                      ? "bg-red-500 text-white"
                                      : "text-red-600"
                                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                  onClick={() => handleDeleteRoom(room._id)}
                                >
                                  Delete
                                </button>
                              )}
                            </Menu.Item>
                          )}
                        </>
                      ) : (
                        <>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={`${
                                  active
                                    ? "bg-blue-500 text-white"
                                    : "text-gray-900"
                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                onClick={() => handleJoinRoom(room._id)}
                              >
                                View
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={`${
                                  active
                                    ? "bg-blue-500 text-white"
                                    : "text-gray-900"
                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                onClick={() => handleLeaveRoom(room._id)}
                              >
                                Leave
                              </button>
                            )}
                          </Menu.Item>
                          {user.role === "Admin" && (
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  className={`${
                                    active
                                      ? "bg-red-500 text-white"
                                      : "text-red-600"
                                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                  onClick={() => handleDeleteRoom(room._id)}
                                >
                                  Delete
                                </button>
                              )}
                            </Menu.Item>
                          )}
                        </>
                      )}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
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
