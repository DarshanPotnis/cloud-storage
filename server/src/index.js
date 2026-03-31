import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import fileRoutes from './routes/files.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);
app.use('/files', fileRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`R2 Endpoint: ${process.env.R2_ENDPOINT}`);
  console.log(`Bucket: ${process.env.S3_BUCKET}`);
});
