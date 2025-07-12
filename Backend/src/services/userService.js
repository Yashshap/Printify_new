import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { withPrefix } from '../utils/idPrefix.js';

const prisma = new PrismaClient();

export const createUser = async (userData) => {
  const { email, password, firstName, lastName, mobile } = userData;
  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already registered');
  // Hash password
  const hashed = await bcrypt.hash(password, 10);
  // Create user with custom ID
  const user = await prisma.user.create({
    data: {
      id: withPrefix('USR'),
      email,
      password: hashed,
      firstName,
      lastName,
      mobile,
      role: 'user',
    },
  });
  // Remove password from returned user
  const { password: _, ...userSafe } = user;
  return userSafe;
};

export const authenticateUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found. Please check your email or sign up.');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Incorrect password. Please try again.');
  const { password: _, ...userSafe } = user;
  return userSafe;
};

export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  const { password: _, ...userSafe } = user;
  return userSafe;
};

export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  const { password: _, ...userSafe } = user;
  return userSafe;
};

export const getUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const { password: _, ...userSafe } = user;
  return userSafe;
};

export const updateUserProfile = async (userId, data) => {
  const { firstName, lastName, mobile, email } = data;
  const user = await prisma.user.update({
    where: { id: userId },
    data: { firstName, lastName, mobile, email },
  });
  const { password: _, ...userSafe } = user;
  return userSafe;
};

export const updateUserProfileImage = async (userId, imageUrl) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { profileImage: imageUrl },
  });
  const { password: _, ...userSafe } = user;
  return userSafe;
}; 