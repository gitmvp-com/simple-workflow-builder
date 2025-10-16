import { createServer } from './server.js';
import { initDatabase } from './database.js';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Initialize database
    initDatabase();
    
    // Create and start server
    const app = createServer();
    
    app.listen(PORT, () => {
      console.log(`🚀 Simple Workflow Builder is running!`);
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`📊 API: http://localhost:${PORT}/api`);
      console.log(`🎨 UI: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

start();
