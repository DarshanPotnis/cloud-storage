import { Router } from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../config/db.js';

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

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, filename, size_bytes, status, created_at
       FROM files WHERE user_id=$1 AND status='complete'
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Files error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/download', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT f.*, c.chunk_index 
       FROM files f
       LEFT JOIN chunk_manifest c ON c.file_id = f.id AND c.chunk_index = 0
       WHERE f.id=$1 AND f.user_id=$2`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'File not found' });

    const s3 = getS3Client();
    
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `${rows[0].s3_key}.part0`,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 300 });
    res.json({ url });
  } catch (err) {
    console.error('Download error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `DELETE FROM files WHERE id=$1 AND user_id=$2 RETURNING s3_key`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'File not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
