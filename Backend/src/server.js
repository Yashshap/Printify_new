import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';
import { router as v1Router } from './routes/v1/index.js';
import { requestLogger } from './middleware/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Process-level error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Recommended: send to error tracking, then exit
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  // Recommended: send to error tracking, then exit
  process.exit(1);
});

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(requestLogger);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Versioned API
app.use('/api/v1', v1Router);

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found: The requested resource does not exist',
    code: 404,
    data: null
  });
});

// Enhanced global error handler middleware
app.use((err, req, res, next) => {
  // Log error with request info
  const user = req.user ? `${req.user.id} (${req.user.role})` : 'guest';
  console.error(`Error [${req.method} ${req.originalUrl}] - User: ${user}`);
  console.error(err);

  // Default error response
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || undefined;
  let validationErrors = err.validationErrors || undefined;

  // Prisma errors
  if (err.code && err.code.startsWith && err.code.startsWith('P2')) {
    status = 400;
    message = 'Database error: ' + (err.meta?.cause || err.message);
    code = err.code;
  }

  // Joi validation errors (from validation middleware)
  if (err.isJoi) {
    status = 400;
    message = 'Validation failed';
    validationErrors = err.details?.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
  }

  // Razorpay custom errors
  if (err.name === 'RazorpayError') {
    status = err.statusCode || 502;
    code = err.errorCode || err.code;
    message = err.description || err.message;
  }

  // Only show stack in development
  const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  res.status(status).json({
    status: 'error',
    message,
    code,
    data: null,
    validationErrors,
    stack
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 