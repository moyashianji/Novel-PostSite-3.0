// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  totpSecret: String,  // 2FA用シークレット
  is2FAEnabled: { type: Boolean, default: false },
  refreshToken: String,
});

module.exports = mongoose.model('TestUser', userSchema);