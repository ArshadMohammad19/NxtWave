const mongoose = require('mongoose');

const UserOTP = new mongoose.Schema({
  email: String,
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  OTP: String,
  OTPCreatedTime: { type: Date, required: true },
  OTPAttempts: { type: Number, default: 0 },
});

const UserOTPModel = mongoose.models.UserOTP || mongoose.model('UserOTP', UserOTP);

module.exports = UserOTPModel;
