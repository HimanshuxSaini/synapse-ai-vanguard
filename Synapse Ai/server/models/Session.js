const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  topic: { type: String, required: true },
  level: { type: String, required: true },
  language: { type: String },
  roadmap: { type: [String] },
  explanation: { type: String },
  projects: { type: [String] },
  mindmap: { type: String },
  resources: { type: [String] },
  videos: [{ title: String, url: String, channel: String }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
