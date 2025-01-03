/* eslint-disable @typescript-eslint/no-unused-vars */
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
  clearNotifications,
  fetchParticipants,
  removeParticipant,
} from "../store/slices/chatSlice";
import { logout } from "../store/slices/authSlice";
import { AppDispatch, RootState } from "../store";
import ChatRoom from "./ChatRoom";
import Notifications from "./Notifications";
import {
  EllipsisVerticalIcon,
  UserIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition, Popover } from "@headlessui/react";
import { BellIcon } from "@heroicons/react/24/outline";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface IChatRoom {
  _id: string;
  name: string;
  is_private: boolean;
  created_by: string;
  created_on: Date;
  participants: string[];
}

interface User {
  _id: string;
  username: string;
  // ... other user properties
}

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { rooms, currentRoom, notifications } = useSelector(
    (state: RootState) => state.chat
  );
  const [newRoomName, setNewRoomName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<{
    field: "name" | "participants" | "created_on";
    order: "asc" | "desc";
  }>({ field: "name", order: "asc" });
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const activeUsers = participants.length;

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  useEffect(() => {
    const newSocket = io("https://real-time-chat-app-6vra.onrender.com");
    setSocket(newSocket);

    newSocket.on(
      "roomDeleted",
      (deletedRoom: { _id: string; name: string }) => {
        dispatch(
          addNotification({
            message: `Room "${deletedRoom.name}" has been deleted`,
            timestamp: new Date().toISOString(),
          })
        );
        dispatch(fetchRooms());
        if (currentRoom && currentRoom._id === deletedRoom._id) {
          dispatch(setCurrentRoom(null));
        }
      }
    );

    // newSocket.on(
    //   "userJoinedRoom",
    //   (data: { username: string; roomName: string }) => {
    //     dispatch(
    //       addNotification({
    //         message: `${data.username} has joined the room "${data.roomName}"`,
    //         timestamp: new Date().toISOString(),
    //       })
    //     );
    //   }
    // );

    // newSocket.on(
    //   "userLeftRoom",
    //   (data: { username: string; roomName: string }) => {
    //     dispatch(
    //       addNotification({
    //         message: `${data.username} has left the room "${data.roomName}"`,
    //         timestamp: new Date().toISOString(),
    //       })
    //     );
    //   }
    // );

    return () => {
      newSocket.disconnect();
    };
  }, [dispatch, currentRoom]);

  useEffect(() => {
    if (currentRoom) {
      dispatch(fetchParticipants(currentRoom._id))
        .unwrap()
        .then((fetchedParticipants) => setParticipants(fetchedParticipants))
        .catch((error) =>
          console.error("Failed to fetch participants:", error)
        );
    }
  }, [currentRoom, dispatch]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      dispatch(createRoom({ name: newRoomName, is_private: false }));
      setNewRoomName("");
      setShowCreateForm(false);
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
      });
    }
  };

  const handleLeaveRoom = (roomId: string) => {
    if (roomId) {
      dispatch(leaveRoom(roomId));
      if (currentRoom && currentRoom._id === roomId) {
        dispatch(setCurrentRoom(null));
      }
    } else {
      console.error("Attempted to leave room with invalid roomId:", roomId);
      toast.error("Failed to leave room");
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    if (roomId && user?.role === "Admin") {
      dispatch(deleteRoom(roomId));
    } else {
      console.error(
        "Attempted to delete room with invalid roomId or insufficient permissions:",
        roomId
      );
      toast.error("Failed to delete room");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleClearNotifications = () => {
    dispatch(clearNotifications());
  };

  const handleRemoveParticipant = (userId: string) => {
    if (currentRoom && user?.role === "Admin") {
      dispatch(removeParticipant({ roomId: currentRoom._id, userId }))
        .unwrap()
        .then(() => {
          setParticipants(participants.filter((p) => p._id !== userId));
          toast.success("Participant removed successfully");
        })
        .catch((error) => {
          console.error("Failed to remove participant:", error);
          toast.error("Failed to remove participant");
        });
    }
  };

  const isUserInRoom = (roomId: string): boolean => {
    if (!user || !user._id || !roomId) return false;
    const room = rooms.find((room) => room._id === roomId);
    return room ? room.participants.includes(user._id.toString()) : false;
  };

  const filteredAndSortedRooms = rooms
    .filter((room: IChatRoom) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((room: IChatRoom) => {
      if (!dateFilter) return true;
      const roomDate = new Date(room.created_on);
      return roomDate.toDateString() === dateFilter.toDateString();
    })
    .sort((a: IChatRoom, b: IChatRoom) => {
      if (sortBy.field === "name") {
        return sortBy.order === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy.field === "participants") {
        return sortBy.order === "asc"
          ? a.participants.length - b.participants.length
          : b.participants.length - a.participants.length;
      } else {
        return sortBy.order === "asc"
          ? new Date(a.created_on).getTime() - new Date(b.created_on).getTime()
          : new Date(b.created_on).getTime() - new Date(a.created_on).getTime();
      }
    });

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-100 p-4 border-r flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Chat Rooms</h2>
          <div className="flex items-center">
            {user.role === "Admin" && (
              <Popover className="relative mr-2">
                {({ open }) => (
                  <>
                    <Popover.Button
                      className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                      aria-label="Create Room"
                    >
                      {showCreateForm ? (
                        <XMarkIcon className="h-6 w-6 text-gray-600" />
                      ) : (
                        <PlusIcon className="h-6 w-6 text-gray-600" />
                      )}
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute right-0 z-10 mt-2 w-64 transform px-4 sm:px-0">
                        <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                          <div className="relative bg-white p-4">
                            <form
                              onSubmit={handleCreateRoom}
                              className="space-y-2"
                            >
                              <input
                                type="text"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                placeholder="New room name"
                                className="w-full px-3 py-2 border rounded-md"
                              />
                              <button
                                type="submit"
                                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                Create Room
                              </button>
                            </form>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            )}
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button className="relative p-1 rounded-full hover:bg-gray-200 focus:outline-none">
                    <BellIcon
                      className="h-5 w-5 text-gray-600"
                      aria-hidden="true"
                    />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </Popover.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute right-0 z-10 mt-2 w-60 transform px-4 sm:px-0">
                      <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="relative bg-white p-4">
                          <Notifications
                            notifications={notifications}
                            handleClearNotifications={handleClearNotifications}
                          />
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
            <Popover className="relative ml-2">
              {({ open }) => (
                <>
                  <Popover.Button className="relative p-1 rounded-full hover:bg-gray-200 focus:outline-none">
                    <UserIcon
                      className="h-5 w-5 text-gray-600"
                      aria-hidden="true"
                    />
                  </Popover.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute right-0 z-10 mt-2 w-64 transform px-4 sm:px-0">
                      <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="relative bg-white p-4">
                          <div className="flex flex-col items-center">
                            <UserIcon className="h-16 w-16 text-gray-400 mb-2" />
                            <h3 className="text-lg font-medium">
                              {user.username}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {user.role}
                            </p>
                            <button
                              onClick={handleLogout}
                              className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </div>
        </div>
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search rooms..."
              className="w-full pl-10 pr-4 py-2 border rounded-md p-1.5 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="mb-4 flex space-x-1">
          <div className="flex-1">
            <select
              className="w-full p-1.5 border rounded-md text-xs"
              value={`${sortBy.field}-${sortBy.order}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy({
                  field: field as "name" | "participants" | "created_on",
                  order: order as "asc" | "desc",
                });
              }}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="participants-desc">
                Participants (High to Low)
              </option>
              <option value="participants-asc">
                Participants (Low to High)
              </option>
              <option value="created_on-desc">
                Creation Date (Newest First)
              </option>
              <option value="created_on-asc">
                Creation Date (Oldest First)
              </option>
            </select>
          </div>

          <div className="flex-1 relative">
            <DatePicker
              selected={dateFilter}
              onChange={(date: Date | null) => setDateFilter(date)}
              placeholderText="Filter by creation date"
              className="w-full pl-8 pr-2 py-1.5 border rounded-md text-xs"
            />
            <CalendarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <ul className="space-y-2 flex-grow overflow-y-auto">
          {filteredAndSortedRooms.map((room) => (
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
      </div>
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <div className="flex-1 flex">
            <div className="w-3/4">
              <ChatRoom roomId={currentRoom._id} />
            </div>
            <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Participants</h3>
              <ul className="space-y-2">
                {participants.map((participant) => (
                  <li
                    key={participant._id}
                    className="flex justify-between items-center"
                  >
                    <span>{participant.username}</span>
                    {user?.role === "Admin" &&
                      user.username !== participant.username && (
                        <button
                          onClick={() =>
                            handleRemoveParticipant(participant._id)
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
