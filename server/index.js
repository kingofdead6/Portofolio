import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import { errorHandler } from './Middleware/error.js';

import authRoutes from './Routes/authRoutes.js';
import contactRoutes from './Routes/contactRoutes.js';
import projectRoutes from './Routes/projectRoutes.js';
import skillRoutes from './Routes/skillRoutes.js';
import categoryRoutes from './Routes/categoryRoutes.js';
import statsRoutes from './Routes/statsRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => res.json({ ok: true, name: 'portfolio-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
