const mongoose = require('mongoose');

const ClientLogoSchema = new mongoose.Schema({
  name: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClientLogo', ClientLogoSchema);