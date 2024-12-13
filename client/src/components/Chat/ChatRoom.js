import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchChatHistory, sendMessage } from "../../utils/api";
import { toast } from "react-toastify";

const ChatRoom = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const getChatHistory = async () => {
      try {
        const response = await fetchChatHistory(roomId);
        setMessages(response.data); // Save messages to state
      } catch (error) {
        console.error("Failed to fetch chat history:", error.message);
      }
    };
    getChatHistory();
  }, [roomId]);
  const handleSend = async () => {
    if (!text.trim()) {
      toast.warning("Message cannot be empty");
      return;
    }
    try {
      const response = await sendMessage(roomId, text);
      setMessages([...messages, response.data.message]);
      setText("");
      toast.success("Message sent!");
      console.log("Message sent:", response.data.message);
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Failed to send message:", error.message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-green-500 p-4 text-white font-bold">Chat Room</div>
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg._id} className="mb-4">
            <strong className="text-green-500">{msg.sender.username}:</strong>{" "}
            <span className="text-gray-700">{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center p-4 border-t bg-white">
        <input
          type="text"
          placeholder="Type a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleSend}
          className="bg-green-500 text-white px-4 py-2 rounded-r-lg hover:bg-green-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
