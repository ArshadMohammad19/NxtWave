const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  age: { type: Number, required: true },
  dateOfBirth: { type: Date, required: true },
  companyName: { type: String, required: true },
  image: { type: String, required: true },
});

// Ensure we don't overwrite the model if it's already defined
const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;
