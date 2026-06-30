import asyncHandler from 'express-async-handler';
import Contact from '../Models/Contact.js';
import validator from 'validator';

// @desc    Create new contact message (public)
// @route   POST /api/contact
export const createContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }
  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error('Please provide a valid email');
  }

  const contact = await Contact.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
  });

  res.status(201).json({
    success: true,
    message: 'Message sent successfully!',
    contactId: contact._id,
  });
});

// @desc    Get all contact messages (admin)
// @route   GET /api/contact
export const getAllContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(contacts);
});

// @desc    Update a message's status (admin)
// @route   PUT /api/contact/:id
export const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error('Message not found');
  }
  if (req.body.status) contact.status = req.body.status;
  await contact.save();
  res.json(contact);
});

// @desc    Delete contact message (admin)
// @route   DELETE /api/contact/:id
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error('Message not found');
  }
  await Contact.deleteOne({ _id: req.params.id });
  res.json({ success: true, message: 'Message deleted' });
});
