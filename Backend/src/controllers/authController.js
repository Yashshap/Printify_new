import * as userService from '../services/userService.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ status: 'success', message: 'User registered', data: user });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, data: null });
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await userService.authenticateUser(req.body.email, req.body.password);
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ status: 'success', message: 'Login successful', data: { user, token } });
  } catch (err) {
    res.status(401).json({ status: 'error', message: err.message, data: null });
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found', data: null });
    }
    res.json({ status: 'success', message: 'User data retrieved', data: user });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message, data: null });
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, mobile } = req.body;
    
    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ status: 'error', message: 'Email already in use', data: null });
      }
    }
    
    const updatedUser = await userService.updateUserProfile(req.user.id, {
      firstName,
      lastName,
      email,
      mobile
    });
    
    res.json({ status: 'success', message: 'Profile updated successfully', data: updatedUser });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, data: null });
  }
};

export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No image file provided', data: null });
    }

    // Create the image URL (you might want to use a CDN or cloud storage in production)
    const imageUrl = `/uploads/profile-images/${req.file.filename}`;
    
    // Update user's profile image in database
    const updatedUser = await userService.updateUserProfileImage(req.user.id, imageUrl);
    
    res.json({ status: 'success', message: 'Profile image uploaded successfully', data: updatedUser });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, data: null });
  }
}; 