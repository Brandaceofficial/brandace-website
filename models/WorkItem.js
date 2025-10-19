const mongoose = require('mongoose');

const workItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WorkItem', workItemSchema);