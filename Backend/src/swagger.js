import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Printify API',
      version: '1.0.0',
      description: 'API documentation for Printify backend',
    },
    servers: [
      { url: '/api/v1' }
    ],
  },
  apis: ['./src/routes/**/*.js'], // Path to your route files for JSDoc comments
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions); 