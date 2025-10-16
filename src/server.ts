import express, { Express } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import workflowRoutes from './routes/workflows.js';
import executionRoutes from './routes/executions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createServer(): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static files
  app.use(express.static(join(__dirname, '../public')));

  // API Routes
  app.use('/api/workflows', workflowRoutes);
  app.use('/api/executions', executionRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}
