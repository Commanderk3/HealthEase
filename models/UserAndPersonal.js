const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Personal Schema
const personalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  bloodGroup: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  aadhar: {
    type: String,
    required: true,
  },
  aabha: {
    type: String,
  },
  guardianName: {
    type: String,
    required: true,
  },
  guardianMobile: {
    type: String,
    required: true,
  },
  guardianEmail: {
    type: String,
  },
  nationality: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
});

// Pre-save hook for hashing user passwords
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to validate user password
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Models
const User = mongoose.model("User", userSchema);
const Personal = mongoose.model("Personal", personalSchema);

module.exports = { User, Personal };






