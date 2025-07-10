import * as userService from '../services/userService.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    res.json({ status: 'success', message: 'User profile fetched', data: user });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, data: null });
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUserProfile(req.user.id, req.body);
    res.json({ status: 'success', message: 'User profile updated', data: user });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, data: null });
  }
};

export const updateUserProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded.', data: null });
    }
    const user = await userService.updateUserProfileImage(req.user.id, req.file.location);
    res.json({ status: 'success', message: 'User profile image updated', data: user });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, data: null });
  }
}; 