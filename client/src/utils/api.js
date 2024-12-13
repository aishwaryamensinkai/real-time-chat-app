import axios from "axios";

const API = axios.create({
  baseURL: "https://real-time-chat-app-6vra.onrender.com/api",
});

export const login = (data) => API.post("/auth/login", data);
export const signup = (data) => API.post("/auth/signup", data);
export const fetchChatRooms = () => API.get("/chatroom");
export const fetchChatHistory = (roomId) =>
  API.get(`/chatroom/history/${roomId}`);
export const sendMessage = (roomId, text) =>
  API.post("/chatroom/message", { roomId, text });
