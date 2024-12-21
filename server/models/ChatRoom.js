// models/ChatRoom.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatRoomSchema = new Schema({
  name: { type: String, required: true, unique: true },
  created_on: { type: Date, default: Date.now },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  is_private: { type: Boolean, default: false },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
