import asyncHandler from 'express-async-handler';
import Project from '../Models/Project.js';

// @desc    Get all published projects (public). Ordered for the Work rail.
// @route   GET /api/projects
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ published: true }).sort({ order: 1, createdAt: 1 });
  res.json(projects);
});

// @desc    Get all projects incl. unpublished (admin)
// @route   GET /api/projects/all
export const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find().sort({ order: 1, createdAt: 1 });
  res.json(projects);
});

// @desc    Get a single project
// @route   GET /api/projects/:id
export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  res.json(project);
});

// @desc    Create a project (admin)
// @route   POST /api/projects
export const createProject = asyncHandler(async (req, res) => {
  const { t, category } = req.body;
  if (!t || !category) {
    res.status(400);
    throw new Error('Title and category are required');
  }
  const project = await Project.create(req.body);
  res.status(201).json(project);
});

// @desc    Update a project (admin)
// @route   PUT /api/projects/:id
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  const fields = ['t', 'category', 'cat', 'year', 'blurb', 'desc', 'stack', 'c1', 'c2', 'order', 'published'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) project[f] = req.body[f];
  });
  await project.save();
  res.json(project);
});

// @desc    Delete a project (admin)
// @route   DELETE /api/projects/:id
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  await Project.deleteOne({ _id: req.params.id });
  res.json({ success: true, message: 'Project deleted' });
});
