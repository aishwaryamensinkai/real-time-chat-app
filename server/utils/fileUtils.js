const mongoose = require("mongoose");
const Grid = require("gridfs-stream");

let gfs;

const connectGridFS = () => {
  const conn = mongoose.connection;
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
};

const storeFile = (file) => {
  return new Promise((resolve, reject) => {
    const writestream = gfs.createWriteStream({
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const readStream = require("fs").createReadStream(file.path);
    readStream.pipe(writestream);

    writestream.on("close", (savedFile) => {
      resolve(savedFile);
    });

    writestream.on("error", (err) => {
      reject(err);
    });
  });
};

const retrieveFile = (fileId) => {
  return new Promise((resolve, reject) => {
    const readstream = gfs.createReadStream({ _id: fileId });
    readstream.on("error", (err) => {
      reject(err);
    });
    resolve(readstream);
  });
};

module.exports = { connectGridFS, storeFile, retrieveFile };
