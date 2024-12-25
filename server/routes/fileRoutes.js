const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storeFile, retrieveFile } = require("../utils/fileUtils");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");
const path = require("path");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Ensure uploads directory exists
const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// File upload route
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!req.body.roomId) {
        return res.status(400).json({ message: "Room ID is required" });
      }
      const userId = req.user.id;

      const savedFile = await storeFile(req.file);

      const newMessage = new Message({
        text: req.body.text || "File uploaded",
        sender: userId,
        room: req.body.roomId,
        attachment: {
          filename: req.file.originalname,
          fileId: savedFile._id,
          contentType: req.file.mimetype,
        },
      });

      await newMessage.save();
      const populatedMessage = await newMessage.populate("sender", "username");

      res.status(201).json({
        message: populatedMessage,
        success: true,
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({
        message: "File upload failed",
        error: error.message,
      });
    }
  }
);

// File download route
router.get("/download/:fileId", authMiddleware, async (req, res) => {
  try {
    const fileStream = await retrieveFile(req.params.fileId);
    const message = await Message.findOne({
      "attachment.fileId": req.params.fileId,
    });

    if (!message) {
      return res.status(404).json({ message: "File not found" });
    }

    res.set("Content-Type", message.attachment.contentType);
    res.set(
      "Content-Disposition",
      `attachment; filename="${message.attachment.filename}"`
    );

    fileStream.pipe(res);
  } catch (error) {
    console.error("File download error:", error);
    res.status(500).json({ message: "File download failed" });
  }
});

module.exports = router;
