const express = require("express");
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const activeUsers = {}; // To track active users in each room using Socket.IO
const fileRoutes = require("./fileRoutes");

// router.use("/files", fileRoutes);

// Create Chat Room (Admin Only)
router.post("/create", authMiddleware, async (req, res) => {
  if (req.user.role !== "Admin")
    return res.status(403).json({ msg: "Access denied" });

  const { name, is_private } = req.body;

  // Validate input
  if (!name) return res.status(400).json({ msg: "Chat room name is required" });

  try {
    // Check if chat room already exists
    let room = await ChatRoom.findOne({ name });
    if (room) return res.status(400).json({ msg: "Chat room already exists" });

    // Create new chat room
    room = new ChatRoom({
      name,
      created_by: req.user.id,
      is_private: is_private || false,
    });

    await room.save();

    res.status(201).json({ msg: "Chat room created", chatRoom: room });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Delete Chat Room (Admin Only)
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "Admin")
    return res.status(403).json({ msg: "Access denied" });

  const roomId = req.params.id;

  try {
    const room = await ChatRoom.findById(roomId);
    if (!room) return res.status(404).json({ msg: "Chat room not found" });

    // Check if any users are active in the room
    const activeInRoom = activeUsers[roomId] || [];
    if (activeInRoom.length > 0) {
      return res
        .status(400)
        .json({ msg: "Cannot delete chat room with active users" });
    }

    await ChatRoom.findByIdAndDelete(roomId);
    res.json({ msg: "Chat room deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Join Chat Room
router.post("/join/:id", authMiddleware, async (req, res) => {
  const roomId = req.params.id;
  const userId = req.user.id;

  try {
    const room = await ChatRoom.findById(roomId);
    if (!room) return res.status(404).json({ msg: "Chat room not found" });

    // Add user to participants if not already present
    if (!room.participants.includes(userId)) {
      room.participants.push(userId);
      await room.save();
    }

    // Add user to active users in the room
    activeUsers[roomId] = activeUsers[roomId] || [];
    if (!activeUsers[roomId].includes(userId)) {
      activeUsers[roomId].push(userId);
    }

    res.json({ msg: "Joined chat room", chatRoom: room });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Leave Chat Room
router.post("/leave/:id", authMiddleware, async (req, res) => {
  const roomId = req.params.id;
  const userId = req.user.id;

  try {
    const room = await ChatRoom.findById(roomId);
    if (!room) return res.status(404).json({ msg: "Chat room not found" });

    // Remove user from participants
    room.participants = room.participants.filter(
      (participant) => participant.toString() !== userId
    );
    await room.save();

    // Remove user from active users in the room
    if (activeUsers[roomId]) {
      activeUsers[roomId] = activeUsers[roomId].filter(
        (activeUser) => activeUser !== userId
      );
    }

    res.json({ msg: "Left chat room", chatRoom: room });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get All Chat Rooms
router.get("/", authMiddleware, async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find().populate(
      "created_by",
      "username email"
    );
    res.json(chatRooms);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Update the sendMessage route to handle file attachments
router.post("/message", authMiddleware, async (req, res) => {
  const { roomId, text, attachmentId } = req.body;
  const userId = req.user.id;

  try {
    const room = await ChatRoom.findById(roomId);
    if (!room) return res.status(404).json({ msg: "Chat room not found" });

    let messageData = {
      text,
      sender: userId,
      room: roomId,
    };

    if (attachmentId) {
      const attachment = await Message.findOne({
        "attachment.fileId": attachmentId,
      });
      if (attachment) {
        messageData.attachment = attachment.attachment;
      }
    }

    const message = new Message(messageData);
    await message.save();

    const populatedMessage = await message.populate("sender", "username");

    res.status(201).json({ msg: "Message sent", message: populatedMessage });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get Chat History
router.get("/history/:roomId", authMiddleware, async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await ChatRoom.findById(roomId);
    if (!room) return res.status(404).json({ msg: "Chat room not found" });

    const messages = await Message.find({ room: roomId })
      .populate("sender", "username")
      .sort("timestamp");

    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get Room Participants
router.get("/participants/:id", authMiddleware, async (req, res) => {
  const roomId = req.params.id;

  try {
    const room = await ChatRoom.findById(roomId).populate(
      "participants",
      "username email"
    );
    if (!room) return res.status(404).json({ msg: "Chat room not found" });

    res.json(room.participants);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Remove Participant (Admin Only)
router.post("/remove-participant", authMiddleware, async (req, res) => {
  const { roomId, userId } = req.body;

  if (req.user.role !== "Admin")
    return res.status(403).json({ msg: "Access denied" });

  try {
    const room = await ChatRoom.findById(roomId);
    if (!room) return res.status(404).json({ msg: "Chat room not found" });

    room.participants = room.participants.filter(
      (participant) => participant.toString() !== userId
    );
    await room.save();

    res.json({ msg: "Participant removed", chatRoom: room });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
