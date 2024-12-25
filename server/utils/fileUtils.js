const mongoose = require("mongoose");
const fs = require("fs");
const { GridFSBucket } = require("mongodb");

let bucket;

// Initialize GridFS bucket
const initBucket = () => {
  if (!bucket) {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });
  }
  return bucket;
};

// Store file in GridFS
const storeFile = async (file) => {
  const bucket = initBucket();

  return new Promise((resolve, reject) => {
    const writeStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
    });

    const readStream = fs.createReadStream(file.path);

    readStream
      .pipe(writeStream)
      .on("error", function (error) {
        reject(error);
      })
      .on("finish", function () {
        // Clean up the temporary file
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error removing temp file:", err);
        });
        resolve(writeStream);
      });
  });
};

// Retrieve file from GridFS
const retrieveFile = async (fileId) => {
  const bucket = initBucket();
  return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
};

module.exports = {
  storeFile,
  retrieveFile,
};
