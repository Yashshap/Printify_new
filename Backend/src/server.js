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

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ status: 'error', message: err.message, data: null });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 