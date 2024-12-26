const express = require("express");
const router = express.Router();
const multer = require("multer");
const { GridFSBucket, ObjectId } = require("mongodb");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

// Configure multer for GridFS
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

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
      const bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: "uploads",
      });

      // Create a unique filename
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${req.file.originalname}`;

      // Upload file to GridFS
      const uploadStream = bucket.openUploadStream(uniqueFilename, {
        contentType: req.file.mimetype,
      });

      // Create a promise to handle the upload
      const uploadPromise = new Promise((resolve, reject) => {
        uploadStream.on("finish", function () {
          resolve(uploadStream.id);
        });
        uploadStream.on("error", reject);
      });

      // Write the file to GridFS
      uploadStream.write(req.file.buffer);
      uploadStream.end();

      // Wait for the upload to complete
      const fileId = await uploadPromise;

      // Create message with attachment
      const newMessage = new Message({
        text: req.body.text || "File uploaded",
        sender: userId,
        room: req.body.roomId,
        attachment: {
          filename: req.file.originalname,
          fileId: fileId.toString(), // Convert ObjectId to string
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

// File download by filename route
router.get("/download-by-name/:filename", authMiddleware, async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);

    // Find the file in GridFS
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    // Find the file metadata
    const files = await bucket
      .find({ filename: { $regex: filename + "$" } })
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    // Get the most recent file if multiple exist
    const file = files.sort((a, b) => b.uploadDate - a.uploadDate)[0];

    res.set("Content-Type", file.contentType);
    res.set("Content-Disposition", `attachment; filename="${filename}"`);

    // Stream the file to the response
    const downloadStream = bucket.openDownloadStream(file._id);
    downloadStream.pipe(res);
  } catch (error) {
    console.error("File download error:", error);
    res.status(500).json({
      message: "File download failed",
      error: error.message,
    });
  }
});

module.exports = router;
