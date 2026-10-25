import { Server } from 'http';
import app from './app.js';
import { connectDB, disconnectDB } from './app/db/index.js';
import { config } from './app/config/index.js';

let server: Server;

async function bootstrap(): Promise<void> {
  try {
    await connectDB();
    server = app.listen(Number(config.PORT), () => {
      console.log(`Backend running on port ${config.PORT} [${config.NODE_ENV}]`);
      console.log(`API:     http://localhost:${config.PORT}/api/v1`);
      console.log(`Health:  http://localhost:${config.PORT}/health`);
      console.log(`Swagger: http://localhost:${config.PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down gracefully…`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
