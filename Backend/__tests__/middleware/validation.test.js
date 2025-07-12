import request from 'supertest';
import express from 'express';
import { validate, validateFile } from '../../src/middleware/validation.js';
import { userRegistrationSchema } from '../../src/validations/schemas.js';

// Create a test app
const createTestApp = (middleware) => {
  const app = express();
  app.use(express.json());
  app.use(middleware);
  app.post('/test', (req, res) => {
    res.json({ success: true, data: req.body });
  });
  return app;
};

describe('Validation Middleware', () => {
  describe('validate function', () => {
    it('should pass validation for valid data', async () => {
      const app = createTestApp(validate(userRegistrationSchema));
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        mobile: '9876543210',
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/test')
        .send(validData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(validData);
    });

    it('should reject invalid data with detailed error messages', async () => {
      const app = createTestApp(validate(userRegistrationSchema));
      const invalidData = {
        firstName: 'John123', // Contains numbers
        email: 'invalid-email', // Invalid email
        mobile: '123', // Invalid mobile
        password: 'weak' // Weak password
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Validation failed');
      expect(response.body.validationErrors).toBeDefined();
      expect(response.body.validationErrors.length).toBeGreaterThan(0);
    });

    it('should reject missing required fields', async () => {
      const app = createTestApp(validate(userRegistrationSchema));
      const emptyData = {};

      const response = await request(app)
        .post('/test')
        .send(emptyData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Validation failed');
    });

    it('should strip unknown fields', async () => {
      const app = createTestApp(validate(userRegistrationSchema));
      const dataWithExtraFields = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        mobile: '9876543210',
        password: 'TestPass123!',
        extraField: 'should be removed',
        anotherField: 'should also be removed'
      };

      const response = await request(app)
        .post('/test')
        .send(dataWithExtraFields)
        .expect(200);

      expect(response.body.data.extraField).toBeUndefined();
      expect(response.body.data.anotherField).toBeUndefined();
      expect(response.body.data.firstName).toBe('John');
    });

    it('should validate query parameters', async () => {
      const app = express();
      app.use(express.json());
      app.use(validate(userRegistrationSchema, 'query'));
      app.get('/test', (req, res) => {
        res.json({ success: true, data: req.query });
      });

      const response = await request(app)
        .get('/test?firstName=John&lastName=Doe&email=john@example.com&mobile=9876543210&password=TestPass123!')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('validateFile function', () => {
    it('should pass validation for valid PDF file', async () => {
      const app = express();
      app.use(validateFile({ fieldName: 'pdf', allowedTypes: ['application/pdf'] }));
      app.post('/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .attach('pdf', Buffer.from('fake pdf content'), {
          filename: 'test.pdf',
          contentType: 'application/pdf'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject missing file', async () => {
      const app = express();
      app.use(validateFile({ fieldName: 'pdf' }));
      app.post('/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('pdf is required');
    });

    it('should reject file with wrong type', async () => {
      const app = express();
      app.use(validateFile({ fieldName: 'pdf', allowedTypes: ['application/pdf'] }));
      app.post('/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .attach('pdf', Buffer.from('fake image content'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg'
        })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('File type not allowed');
    });

    it('should reject file that is too large', async () => {
      const app = express();
      app.use(validateFile({ fieldName: 'pdf', maxSize: 1024 })); // 1KB limit
      app.post('/test', (req, res) => {
        res.json({ success: true });
      });

      // Create a large buffer
      const largeBuffer = Buffer.alloc(2048); // 2KB

      const response = await request(app)
        .post('/test')
        .attach('pdf', largeBuffer, {
          filename: 'large.pdf',
          contentType: 'application/pdf'
        })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('File size must be less than 1MB');
    });

    it('should work with different field names', async () => {
      const app = express();
      app.use(validateFile({ fieldName: 'document', allowedTypes: ['application/pdf'] }));
      app.post('/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .attach('document', Buffer.from('fake pdf content'), {
          filename: 'test.pdf',
          contentType: 'application/pdf'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Integration tests', () => {
    it('should handle multiple validation errors', async () => {
      const app = createTestApp(validate(userRegistrationSchema));
      const invalidData = {
        firstName: '', // Empty required field
        lastName: 'Doe123', // Contains numbers
        email: 'not-an-email', // Invalid email
        mobile: '123', // Invalid mobile
        password: 'weak' // Weak password
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.validationErrors.length).toBeGreaterThan(1);
    });

    it('should provide field-specific error messages', async () => {
      const app = createTestApp(validate(userRegistrationSchema));
      const invalidData = {
        firstName: 'John123',
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData)
        .expect(400);

      const errorFields = response.body.validationErrors.map(err => err.field);
      expect(errorFields).toContain('firstName');
      expect(errorFields).toContain('email');
    });
  });
}); 