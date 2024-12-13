// server.js

require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const chatRoomRoutes = require("./routes/chatRoomRoutes");
const Message = require("./models/Message");
const ChatRoom = require("./models/ChatRoom");
const User = require("./models/User");
const errorMiddleware = require("./middleware/errorMiddleware"); // Import error middleware

const app = express();
const server = http.createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chatroom", chatRoomRoutes);

// Placeholder route
app.get("/", (req, res) => res.send("Real-Time Chat Application API"));

// Use error handling middleware
app.use(errorMiddleware);

// Real-Time Communication with Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a chat room
  socket.on("joinRoom", async ({ roomId, userId }) => {
    try {
      const room = await ChatRoom.findById(roomId);
      const user = await User.findById(userId);
      if (!room || !user) {
        socket.emit("error", { msg: "Room or user not found" });
        return;
      }

      socket.join(roomId);
      console.log(`${user.username} joined room: ${room.name}`);

      // Notify others in the room
      socket.to(roomId).emit("userJoined", { username: user.username });

      // Optionally, send the chat history
      const messages = await Message.find({ room: roomId })
        .populate("sender", "username")
        .sort("timestamp");
      socket.emit("chatHistory", messages);
    } catch (err) {
      console.error(err);
      socket.emit("error", { msg: "An error occurred while joining the room" });
    }
  });

  // Handle sending messages
  socket.on("sendMessage", async ({ roomId, userId, text }) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        socket.emit("error", { msg: "User not found" });
        return;
      }

      const message = new Message({
        text,
        sender: userId,
        room: roomId,
      });

      await message.save();

      const populatedMessage = await message.populate("sender", "username");

      // Emit the message to the room
      io.to(roomId).emit("newMessage", populatedMessage);
    } catch (err) {
      console.error(err);
      socket.emit("error", {
        msg: "An error occurred while sending the message",
      });
    }
  });

  // Handle leaving a chat room
  socket.on("leaveRoom", async ({ roomId, userId }) => {
    try {
      const room = await ChatRoom.findById(roomId);
      const user = await User.findById(userId);
      if (!room || !user) {
        socket.emit("error", { msg: "Room or user not found" });
        return;
      }

      socket.leave(roomId);
      console.log(`${user.username} left room: ${room.name}`);

      // Notify others in the room
      socket.to(roomId).emit("userLeft", { username: user.username });
    } catch (err) {
      console.error(err);
      socket.emit("error", { msg: "An error occurred while leaving the room" });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Optional: Handle user disconnection logic
  });
});

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
