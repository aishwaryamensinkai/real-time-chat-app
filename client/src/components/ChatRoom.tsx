import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  addMessage,
  sendMessage,
  addSystemMessage,
  setActiveUsers,
  addNotification,
  fetchParticipants,
  selectParticipants,
  setCurrentRoom,
  removeMember,
} from "../store/slices/chatSlice";
import { AppDispatch, RootState } from "../store";
import { io, Socket } from "socket.io-client";
import { formatDate } from "../utils/dateFormatter";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
export interface ChatRoomProps {
  roomId: string;
}

interface User {
  _id: string;
  username: string;
}

interface Message {
  _id: string;
  sender: User;
  text: string;
  timestamp: string;
  type: "user" | "system";
  room: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { messages, activeUsers, currentRoom } = useSelector(
    (state: RootState) => state.chat
  );
  const { user, token } = useSelector((state: RootState) => state.auth);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const participants = useSelector(selectParticipants);

  useEffect(() => {
    if (roomId) {
      dispatch(fetchMessages(roomId));
      dispatch(fetchParticipants(roomId));
    }
  }, [roomId, dispatch]);

  useEffect(() => {
    if (roomId && user && token) {
      const newSocket = io("https://real-time-chat-app-6vra.onrender.com", {
        query: { token },
      });

      newSocket.emit("joinRoom", { roomId, userId: user._id });

      newSocket.on("newMessage", (newMessage: Message) => {
        dispatch(addMessage(newMessage));
      });

      newSocket.on(
        "userJoinedRoom",
        (data: { username: string; roomName: string }) => {
          dispatch(
            addSystemMessage({
              text: `${data.username} is active in the room`,
              timestamp: new Date().toISOString(),
            })
          );
          dispatch(
            addNotification({
              message: `${data.username} is active in the room ${data.roomName}`,
              timestamp: new Date().toISOString(),
            })
          );
        }
      );

      // newSocket.on(
      //   "userLeftRoom",
      //   (data: { username: string; roomName: string }) => {
      //     dispatch(
      //       addSystemMessage({
      //         text: `${data.username} has left the room`,
      //         timestamp: new Date().toISOString(),
      //       })
      //     );
      //     dispatch(
      //       addNotification({
      //         message: `${data.username} has left the room ${data.roomName}`,
      //         timestamp: new Date().toISOString(),
      //       })
      //     );
      //   }
      // );

      newSocket.on("activeUsers", (count: number) => {
        dispatch(setActiveUsers(count));
      });

      newSocket.on("memberRemoved", ({ removedUserId, adminUsername }) => {
        dispatch(
          addSystemMessage({
            text: `${adminUsername} removed a member from the room`,
            timestamp: new Date().toISOString(),
          })
        );
        dispatch(fetchParticipants(roomId));
      });

      newSocket.on("youWereRemoved", ({ roomId, roomName }) => {
        dispatch(
          addNotification({
            message: `You were removed from the room "${roomName}"`,
            timestamp: new Date().toISOString(),
          })
        );
        if (currentRoom && currentRoom._id === roomId) {
          dispatch(setCurrentRoom(null));
        }
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.emit("leaveRoom", {
            roomId,
            userId: user._id,
          });
          newSocket.off("newMessage");
          newSocket.off("userJoinedRoom");
          newSocket.off("userLeftRoom");
          newSocket.off("activeUsers");
          newSocket.off("memberRemoved");
          newSocket.off("youWereRemoved");
          newSocket.disconnect();
        }
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

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const renderMessages = () => {
    const groupedMessages = groupMessagesByDate(messages);
    return Object.entries(groupedMessages).map(([date, msgs]) => (
      <React.Fragment key={date}>
        <div className="flex justify-center my-4">
          <span className="px-4 py-2 bg-gray-200 rounded-full text-sm text-gray-600">
            {formatDate(new Date(date))}
          </span>
        </div>
        {msgs.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${
              msg.type === "system"
                ? "justify-center"
                : msg.sender._id === user?._id?.toString()
                ? "justify-end"
                : "justify-start"
            } mb-4`}
          >
            {msg.type === "system" ? (
              <div className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
                {msg.text}
              </div>
            ) : (
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender._id === user?._id?.toString()
                    ? "bg-blue-100 text-black"
                    : "bg-gray-200"
                }`}
              >
                <p className="font-semibold text-sm">{msg.sender.username}</p>
                <p>{msg.text}</p>
                <p
                  className="text-xs text-gray-500"
                  style={{ textAlign: "right", fontSize: "10px" }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        ))}
      </React.Fragment>
    ));
  };

  const handleRemoveMember = (userId: string) => {
    if (currentRoom && socket) {
      dispatch(removeMember({ roomId: currentRoom._id, userId }));
      socket.emit("memberRemoved", {
        roomId: currentRoom._id,
        removedUserId: userId,
        adminUsername: user?.username,
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-200 p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">{currentRoom?.name || "Unknown"}</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-semibold">
            Active Users: {activeUsers}
          </span>
          <button
            onClick={() => setShowParticipants(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50 transition duration-150 ease-in-out"
          >
            View Participants
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-lg">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          renderMessages()
        )}
      </div>
      <Transition.Root show={showParticipants} as={React.Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={setShowParticipants}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={React.Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-lg font-medium text-gray-900">
                            Participants
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              onClick={() => setShowParticipants(false)}
                            >
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        <ul className="space-y-2">
                          {participants.map((participant) => (
                            <li
                              key={participant._id}
                              className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                {participant.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {participant.username}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {participant.email}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
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
