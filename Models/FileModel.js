const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  accessCode: {
    type: Number,
    required: true,
    unique: true,
  },
  filename: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  encoding: {
    type: String,
    required: false,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  path: {
    type: String,
    required: true, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, 
  },
});

const FileModel = mongoose.model('File', fileSchema);

module.exports = FileModel;
