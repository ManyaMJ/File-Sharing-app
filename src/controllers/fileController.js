const File = require('../models/File');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Upload File
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileId = uuidv4();
    
    const fileData = new File({
      fileId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      createdBy: req.user._id
    });

    await fileData.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      fileId,
      downloadLink: `${req.protocol}://${req.get('host')}/api/files/download/${fileId}`,
      file: {
        id: fileData._id,
        filename: fileData.originalName,
        size: fileData.fileSize,
        uploadTime: fileData.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Download File
const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findOne({ fileId });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Increment download count
    file.downloadCount += 1;
    await file.save();

    // Send file
    res.download(file.filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User's Files
const getUserFiles = async (req, res) => {
  try {
    const files = await File.find({ createdBy: req.user._id })
      .select('-filePath')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Files retrieved successfully',
      files: files.map(file => ({
        id: file._id,
        fileId: file.fileId,
        filename: file.originalName,
        size: file.fileSize,
        downloadCount: file.downloadCount,
        uploadTime: file.createdAt,
        downloadLink: `${req.protocol}://${req.get('host')}/api/files/download/${file.fileId}`
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadFile, downloadFile, getUserFiles };