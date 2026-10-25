import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { corsOptions } from './app/config/index.js';
import {
  requestId,
  generalLimiter,
  notFound,
} from './app/middlewares/index.js';
import { globalErrorHandler } from './app/errors/index.js';
import router from './app/routes/index.js';
import { prisma } from './app/db/index.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app: Application = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(compression());

app.use(requestId);

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      JSON.stringify({
        requestId: req.headers['x-request-id'],
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      })
    );
  });
  next();
});

app.use(generalLimiter);

app.use('/api/v1', router);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'OK' });
});

app.get('/health/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      message: 'Ready',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Not Ready',
      database: 'disconnected',
    });
  }
});

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project API',
      version: '1.0.0',
      description: 'Project Review Backend API',
    },
    components: {
      securitySchemes: {
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' },
      },
    },
  },
  apis: ['./src/docs/swagger.yaml', './api/docs/swagger.yaml'],
});

const swaggerUiOptions = {
  customCssUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js',
  ],
};

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
