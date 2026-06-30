import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../Models/User.js';
import validator from 'validator';

// Login user
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !validator.isEmail(email)) {
    res.status(400);
    throw new Error('Valid email is required');
  }
  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { id: user._id, usertype: user.usertype },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.status(200).json({ token, usertype: user.usertype, name: user.name });
});

// Register user (superadmin only)
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, usertype } = req.body;

  if (!name || !validator.isLength(name, { min: 1, max: 100 })) {
    res.status(400);
    throw new Error('Valid name required');
  }
  if (!email || !validator.isEmail(email)) {
    res.status(400);
    throw new Error('Valid email required');
  }
  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }
  if (!usertype || !['user', 'admin', 'superadmin'].includes(usertype)) {
    res.status(400);
    throw new Error('Valid usertype required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('Email already exists');
  }

  const user = await User.create({ name, email, password, usertype });
  res.status(201).json({ id: user._id, name, email, usertype });
});

// Get all users (superadmin only)
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').lean();
  res.status(200).json(users);
});

// Update user (superadmin only)
export const updateUser = asyncHandler(async (req, res) => {
  const { name, email, usertype } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (usertype) user.usertype = usertype;

  await user.save();
  res.status(200).json({ id: user._id, name: user.name, email: user.email, usertype: user.usertype });
});

// Delete user (superadmin only)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.usertype === 'superadmin') {
    res.status(400);
    throw new Error('Cannot delete superadmin');
  }
  await User.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: 'User deleted' });
});

// Register Super Admin (open route — used once to bootstrap the first admin)
export const registerSuperAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !validator.isLength(name, { min: 1, max: 100 })) {
    res.status(400);
    throw new Error('Valid name required');
  }
  if (!email || !validator.isEmail(email)) {
    res.status(400);
    throw new Error('Valid email required');
  }
  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('Email already exists');
  }

  const superAdmin = await User.create({ name, email, password, usertype: 'superadmin' });
  res.status(201).json({
    id: superAdmin._id,
    name: superAdmin.name,
    email: superAdmin.email,
    usertype: superAdmin.usertype,
  });
});

// Update a user's password (superadmin only)
export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (!req.body.password || req.body.password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }
  user.password = req.body.password;
  await user.save();
  res.json({ message: 'Password updated' });
});
