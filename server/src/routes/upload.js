import { Router } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../config/db.js';
import crypto from 'crypto';

const router = Router();

function getS3Client() {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

router.post('/init', requireAuth, async (req, res) => {
  const { filename, fileSize } = req.body;
  const s3Key = `${req.user.id}/${crypto.randomUUID()}/${filename}`;
  try {
    const { rows } = await db.query(
      `INSERT INTO files (user_id, filename, s3_key, size_bytes, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
      [req.user.id, filename, s3Key, fileSize]
    );
    res.json({ fileId: rows[0].id, s3Key });
  } catch (err) {
    console.error('Init error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/presign', requireAuth, async (req, res) => {
  const { s3Key, chunkIndex } = req.body;
  try {
    const s3 = getS3Client();
    console.log('Using endpoint:', process.env.R2_ENDPOINT);
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `${s3Key}.part${chunkIndex}`,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 900 });
    console.log('Generated URL:', url.substring(0, 60));
    res.json({ url });
  } catch (err) {
    console.error('Presign error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/complete', requireAuth, async (req, res) => {
  const { fileId, chunks } = req.body;
  try {
    for (const chunk of chunks) {
      await db.query(
        `INSERT INTO chunk_manifest (file_id, chunk_index, etag, sha256)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (file_id, chunk_index) DO UPDATE SET etag=$3, sha256=$4`,
        [fileId, chunk.index, chunk.etag, chunk.sha256]
      );
    }
    await db.query(
      `UPDATE files SET status='complete' WHERE id=$1 AND user_id=$2`,
      [fileId, req.user.id]
    );
    res.json({ success: true, fileId });
  } catch (err) {
    console.error('Complete error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
