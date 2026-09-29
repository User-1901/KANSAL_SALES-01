import 'dotenv/config';
import { dbReady } from './db.js';
import app from './app.js';
import { storageServerService } from './services/storage.service.js';

const PORT = process.env.PORT ?? 3000;

// Wait for DB init to complete before accepting requests
dbReady.then(async () => {
  await storageServerService.ensureProductImagesBucket();
  app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
  });
}).catch((error: unknown) => {
  console.error('[Server] Startup failed:', error);
  process.exit(1);
});
