const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storeFile, retrieveFile } = require("../utils/fileUtils");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");

const upload = multer({ dest: "uploads/" });

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const savedFile = await storeFile(req.file);

      const newMessage = new Message({
        text: req.body.text || "File uploaded",
        sender: req.user._id,
        room: req.body.roomId,
        attachment: {
          filename: req.file.originalname,
          fileId: savedFile._id,
          contentType: req.file.mimetype,
        },
      });

      await newMessage.save();

      res.status(201).json({ message: newMessage });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "File upload failed" });
    }
  }
);

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
