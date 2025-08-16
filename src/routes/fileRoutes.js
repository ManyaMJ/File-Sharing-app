const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadFile, downloadFile, getUserFiles } = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types for now
    cb(null, true);
  }
});

// POST /api/files/upload (protected)
router.post('/upload', authMiddleware, upload.single('file'), uploadFile);

// GET /api/files/download/:fileId (public)
router.get('/download/:fileId', downloadFile);

// GET /api/files/user (protected)
router.get('/user', authMiddleware, getUserFiles);

module.exports = router;