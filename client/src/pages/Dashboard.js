import React, { useEffect, useState } from "react";
import { fetchChatRooms } from "../utils/api";
import ChatList from "../components/Chat/ChatList";

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await fetchChatRooms();
      setRooms(data);
    })();
  }, []);

  return (
    <div className="dashboard">
      <h2>Available Chat Rooms</h2>
      <ChatList rooms={rooms} />
    </div>
  );
};

export default Dashboard;
