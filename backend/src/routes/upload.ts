import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { PRODUCT_IMAGES_BUCKET } from '../constants/storage.js';
import { storageServerService } from '../services/storage.service.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    const ok = allowedTypes.has(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
  },
});

const router = Router();

// POST /api/upload — admin only
router.post('/', authenticate, requireAdmin, upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded.' });
    return;
  }

  try {
    const extension = path.extname(req.file.originalname).toLowerCase() || '.bin';
    const filePath = `products/${crypto.randomUUID()}${extension}`;
    const url = await storageServerService.uploadFile(
      PRODUCT_IMAGES_BUCKET,
      filePath,
      req.file.buffer,
      req.file.mimetype
    );
    res.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload image.';
    res.status(500).json({ error: message });
  }
});

export default router;
