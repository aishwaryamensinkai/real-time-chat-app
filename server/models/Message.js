// models/Message.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
  attachment: {
    filename: String,
    fileId: String, // Store as string for better compatibility
    contentType: String,
  },
});

module.exports = mongoose.model("Message", messageSchema);
