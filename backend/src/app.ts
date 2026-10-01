import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { sanitize } from './middleware/sanitize.js';
import authRouter from './routes/auth.js';
import categoriesRouter from './routes/categories.js';
import productsRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import contactRouter from './routes/contact.js';
import adminsRouter from './routes/admins.js';
import uploadRouter from './routes/upload.js';
import ratingsRouter from './routes/ratings.js';
import checkoutRouter from './routes/checkout.js';
import deliveryRouter from './routes/delivery.js';
import inventoryRouter from './routes/inventory.js';
import adminOrdersRouter from './routes/admin-orders.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();

const configuredClientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
let clientOrigin = configuredClientOrigin;
try {
  clientOrigin = new URL(configuredClientOrigin).origin;
} catch {
  console.warn(`[CORS] Invalid CLIENT_ORIGIN: ${configuredClientOrigin}`);
}

// ──────────────────────────────────────────────────────────────────────────────
// SECURITY MIDDLEWARE - Protect against common web vulnerabilities
// ──────────────────────────────────────────────────────────────────────────────

// Helmet: Sets security HTTP headers (prevents XSS, clickjacking, mime-type attacks, etc.)
// SECURITY: crossOriginResourcePolicy: 'cross-origin' allows serving files to external origins
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS: Enable cross-origin requests from frontend
// SECURITY: Restrict to frontend origin only in production (set CLIENT_ORIGIN env var)
app.use(cors({ origin: clientOrigin, credentials: true }));

// Body parsing: Convert JSON/form data to JavaScript objects
app.use(express.json());
app.use(cookieParser());

// Input sanitization: Escape HTML entities to prevent XSS attacks
app.use(sanitize);

// ──────────────────────────────────────────────────────────────────────────────
// STATIC FILES & HEALTH CHECK
// ──────────────────────────────────────────────────────────────────────────────

// Serve uploaded product images as static files

// Frontend is deployed separately, so this service only serves API endpoints
// (no need to serve frontend build from backend)

// Health check endpoint - used by load balancers and monitoring
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Kansal Sales API' });
});

// ──────────────────────────────────────────────────────────────────────────────
// API ROUTES - Organized by feature
// ──────────────────────────────────────────────────────────────────────────────
// Authentication & User Management
app.use('/api/auth', authRouter);

// Product Catalog
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/delivery', deliveryRouter);

// Shopping Cart & Orders
app.use('/api/cart', cartRouter);
app.use(checkoutRouter);

// Customer Support
app.use('/api/contact', contactRouter);

// Admin Panel
app.use('/api/admins', adminsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/admin/orders', adminOrdersRouter);

// File Uploads (product images)
// Removed local filesystem serving for uploads
app.use('/api/upload', uploadRouter);

export default app;
