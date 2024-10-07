const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Create Mongoose model
const User = mongoose.model('User', userSchema);

// Function to create a new user
const createUser = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
  const newUser = new User({ username, password: hashedPassword });
  return await newUser.save(); // Save the user to MongoDB
};

// Function to get a user by their username
const getUserByUsername = async (username) => {
  return await User.findOne({ username }); // Find the user in MongoDB by username
};

// Export the functions and User model
module.exports = { createUser, getUserByUsername }; 