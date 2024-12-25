import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  addMessage,
  sendMessage,
  addSystemMessage,
  setActiveUsers,
  addNotification,
  uploadAttachment,
  downloadAttachment,
} from "../store/slices/chatSlice";
import { AppDispatch, RootState } from "../store";
import { io, Socket } from "socket.io-client";
import { formatDate } from "../utils/dateFormatter";
import { PaperClipIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export interface ChatRoomProps {
  roomId: string;
}

interface User {
  _id: string;
  username: string;
}

interface Attachment {
  filename: string;
  fileId: string;
  contentType: string;
}

interface Message {
  _id: string;
  sender: User;
  text: string;
  timestamp: string;
  type: "user" | "system";
  room: string;
  attachment?: Attachment;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { messages, activeUsers, currentRoom } = useSelector(
    (state: RootState) => state.chat
  );
  const { user, token } = useSelector((state: RootState) => state.auth);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          newSocket.disconnect();
        }
      };
    }
  }, [roomId, user, token, dispatch]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || file) && roomId && user) {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("roomId", roomId);
        formData.append("text", message);
        try {
          const result = await dispatch(uploadAttachment(formData));
          if (uploadAttachment.rejected.match(result)) {
            throw new Error((result.payload as string) || "Upload failed");
          }
          // console.log("Upload successful:", result.payload);
          // The message with the attachment will be added to the state by the thunk
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } catch (error) {
          console.error("Upload error:", error);
          // You might want to show an error message to the user here
        }
      } else {
        dispatch(sendMessage({ roomId, text: message }));
      }
      setMessage("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownload = (attachment: Attachment) => {
    dispatch(
      downloadAttachment({
        fileId: attachment.fileId,
        filename: attachment.filename,
      })
    );
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
                : msg.sender?._id === user?._id?.toString()
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
                  msg.sender?._id === user?._id?.toString()
                    ? "bg-blue-100 text-black"
                    : "bg-gray-200"
                }`}
              >
                <p className="font-semibold text-sm">
                  {msg.sender?.username || "Unknown User"}
                </p>
                <p>{msg.text}</p>
                {msg.attachment && (
                  <div className="mt-2">
                    <button
                      onClick={() => handleDownload(msg.attachment!)}
                      className="flex items-center text-blue-500 hover:text-blue-700"
                      aria-label={`Download ${msg.attachment.filename}`}
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                      <span className="underline">
                        {msg.attachment.filename}
                      </span>
                    </button>
                  </div>
                )}
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

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-200 p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">{currentRoom?.name || "Unknown"}</h2>
        <span className="text-sm font-semibold">
          Active Users: {activeUsers}
        </span>
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
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        {file && (
          <div className="pb-1 font-bold text-sm text-gray-600">
            {file.name}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-gray-200 p-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            <PaperClipIcon className="h-6 w-6 text-gray-600" />
            <span className="sr-only">Attach file</span>
          </label>
          <input
            id="file-upload"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload file"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
