// job-portal-node-server-master\services\profilePicture.service.server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const session = require('express-session');

// MongoDB connection URI
const mongoURI = 'mongodb+srv://aditya:k353OKjCl6XfGw13@cluster0.cvuu6yu.mongodb.net/?retryWrites=true&w=majority';

// Establish MongoDB connection using Mongoose
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Initialize GridFS stream
let gfs;

mongoose.connection.once('open', () => {
  // Initialize GridFS stream
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'profile-pictures'
  });
});

module.exports = function (app) {
  app.use(session({
    resave: false,
    saveUninitialized: true,
    duration: 30 * 60 * 1000,
    activeDuration: 30 * 60 * 1000,
    secret: 'any string',
    cookie: {
      sameSite: 'None',
      secure: true, // Set this to true if your app is served over HTTPS
    },
  }));

  // Create storage engine
  const storage = new GridFsStorage({
    url: mongoURI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
      return {
        filename: 'profile-pic-' + Date.now() + path.extname(file.originalname),
        bucketName: 'profile-pictures',
        metadata: {
          userId: mongoose.Types.ObjectId(req.session.user._id)
        },
      };
    }
  });

  const upload = multer({ storage }).single('profilePic');

  // Route for uploading profile picture
  app.post('/upload-profile-pic', (req, res) => {
    const userId = mongoose.Types.ObjectId(req.session.user._id);

    // Check if user already has a profile picture
    gfs.find({ 'metadata.userId': userId })
      .toArray((err, files) => {
        if (err) {
          console.error('Error finding existing profile picture:', err);
          return res.status(500).json({ error: 'Error finding existing profile picture' });
        }

        if (files.length > 0) {
          // User already has a profile picture, delete it
          const fileId = files[0]._id;
          gfs.delete(fileId, (deleteErr) => {
            if (deleteErr) {
              console.error('Error deleting existing profile picture:', deleteErr);
              return res.status(500).json({ error: 'Error deleting existing profile picture' });
            }

            // Proceed to upload the new file
            uploadFile();
          });
        } else {
          // No existing profile picture, proceed to upload the new file
          uploadFile();
        }
      });

    function uploadFile() {
      upload(req, res, (err) => {
        if (err) {
          console.error('Error during file upload:', err);
          return res.json({ error_code: 1, err_desc: err });
        }

        res.json({ error_code: 0, error_desc: null, file_uploaded: true, profilePicUrl: req.file.path });
      });
    }
  });

  // Route for fetching uploaded profile picture
  app.get('/profile-pic/:userId', (req, res) => {
    const userId = req.params.userId;

    gfs.find({ 'metadata.userId': mongoose.Types.ObjectId(userId) })
      .sort({ uploadDate: -1 })
      .limit(1)
      .toArray((err, files) => {
        if (err) {
          return res.status(500).json({ error: 'Error retrieving profile picture' });
        }

        if (!files || files.length === 0) {
          return res.status(200).json({ message: 'No profile picture for user' });
        }

        const file = files[0];
        const readStream = gfs.openDownloadStream(file._id);
        readStream.pipe(res);
      });
  });
};
