import app from './app.js';
import config from './config/config.js';
import { initDB } from './config/db.js';

const PORT = config.PORT || 5000;

const startServer = async () => {
  // Initialize Database & Schema tables
  await initDB();

  app.listen(PORT, () => {
    console.log(`🚀 LogicLoom Backend running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`🤖 ML Gateway API: http://localhost:${PORT}/api/ml`);
    console.log(`🌍 Environment: ${config.NODE_ENV}`);
  });
};

startServer();
