import request from 'supertest';
import express from 'express';
import { createServer } from '../../src/server.js';

let app;

beforeAll(async () => {
  app = await createServer();
});

describe('API Validation Integration Tests', () => {
  describe('Auth Endpoints', () => {
    describe('POST /api/v1/auth/signup', () => {
      it('should accept valid user registration data', async () => {
        const validData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          mobile: '9876543210',
          password: 'TestPass123!'
        };

        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send(validData)
          .expect(201);

        expect(response.body.status).toBe('success');
      });

      it('should reject invalid email format', async () => {
        const invalidData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
          mobile: '9876543210',
          password: 'TestPass123!'
        };

        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send(invalidData)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Validation failed');
        expect(response.body.validationErrors).toBeDefined();
      });

      it('should reject weak password', async () => {
        const invalidData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          mobile: '9876543210',
          password: 'weak'
        };

        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send(invalidData)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Validation failed');
      });

      it('should reject names with numbers', async () => {
        const invalidData = {
          firstName: 'John123',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          mobile: '9876543210',
          password: 'TestPass123!'
        };

        const response = await request(app)
          .post('/api/v1/auth/signup')
          .send(invalidData)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Validation failed');
      });
    });

    describe('POST /api/v1/auth/login', () => {
      it('should accept valid login data', async () => {
        const validData = {
          email: 'john.doe@example.com',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/v1/auth/login')
          .send(validData)
          .expect(200);

        expect(response.body.status).toBe('success');
      });

      it('should reject invalid email format', async () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/v1/auth/login')
          .send(invalidData)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Validation failed');
      });
    });
  });

  describe('Orders Endpoints', () => {
    describe('POST /api/v1/orders/create', () => {
      it('should reject order creation without authentication', async () => {
        const validData = {
          storeId: 'SHP_550e8400-e29b-41d4-a716-446655440000',
          colorMode: 'color',
          pageRange: '1-5'
        };

        const response = await request(app)
          .post('/api/v1/orders/create')
          .field('storeId', validData.storeId)
          .field('colorMode', validData.colorMode)
          .field('pageRange', validData.pageRange)
          .attach('pdf', Buffer.from('fake pdf content'), {
            filename: 'test.pdf',
            contentType: 'application/pdf'
          })
          .expect(401);

        expect(response.body.status).toBe('error');
      });

      it('should reject invalid store ID format', async () => {
        const invalidData = {
          storeId: 'INVALID_ID',
          colorMode: 'color',
          pageRange: '1-5'
        };

        const response = await request(app)
          .post('/api/v1/orders/create')
          .field('storeId', invalidData.storeId)
          .field('colorMode', invalidData.colorMode)
          .field('pageRange', invalidData.pageRange)
          .attach('pdf', Buffer.from('fake pdf content'), {
            filename: 'test.pdf',
            contentType: 'application/pdf'
          })
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Validation failed');
      });

      it('should reject invalid color mode', async () => {
        const invalidData = {
          storeId: 'SHP_550e8400-e29b-41d4-a716-446655440000',
          colorMode: 'invalid',
          pageRange: '1-5'
        };

        const response = await request(app)
          .post('/api/v1/orders/create')
          .field('storeId', invalidData.storeId)
          .field('colorMode', invalidData.colorMode)
          .field('pageRange', invalidData.pageRange)
          .attach('pdf', Buffer.from('fake pdf content'), {
            filename: 'test.pdf',
            contentType: 'application/pdf'
          })
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Validation failed');
      });

      it('should reject invalid page range', async () => {
        const invalidData = {
          storeId: 'SHP_550e8400-e29b-41d4-a716-446655440000',
          colorMode: 'color',
          pageRange: 'invalid'
        };

        const response = await request(app)
          .post('/api/v1/orders/create')
          .field('storeId', invalidData.storeId)
          .field('colorMode', invalidData.colorMode)
          .field('pageRange', invalidData.pageRange)
          .attach('pdf', Buffer.from('fake pdf content'), {
            filename: 'test.pdf',
            contentType: 'application/pdf'
          })
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Validation failed');
      });

      it('should reject non-PDF files', async () => {
        const validData = {
          storeId: 'SHP_550e8400-e29b-41d4-a716-446655440000',
          colorMode: 'color',
          pageRange: '1-5'
        };

        const response = await request(app)
          .post('/api/v1/orders/create')
          .field('storeId', validData.storeId)
          .field('colorMode', validData.colorMode)
          .field('pageRange', validData.pageRange)
          .attach('pdf', Buffer.from('fake image content'), {
            filename: 'test.jpg',
            contentType: 'image/jpeg'
          })
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('File type not allowed');
      });
    });

    describe('GET /api/v1/orders/user', () => {
      it('should reject without authentication', async () => {
        const response = await request(app)
          .get('/api/v1/orders/user')
          .expect(401);

        expect(response.body.status).toBe('error');
      });

      it('should validate query parameters', async () => {
        const response = await request(app)
          .get('/api/v1/orders/user?status=invalid&skip=-1&take=150')
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Validation failed');
      });
    });
  });

  describe('Stores Endpoints', () => {
    describe('POST /api/v1/stores/register', () => {
      it('should reject without authentication', async () => {
        const validData = {
          storeName: 'Test Store',
          businessType: 'individual',
          shopAddress: '123 Test Street, Test City, Test State 123456',
          billingAddress: '123 Test Street, Test City, Test State 123456',
          ownerName: 'John Doe',
          pan: 'ABCDE1234F',
          bankAccountNumber: '1234567890',
          ifsc: 'ABCD0123456',
          kycAddress: '123 Test Street, Test City, Test State 123456',
          contactEmail: 'contact@teststore.com',
          contactPhone: '9876543210'
        };

        const response = await request(app)
          .post('/api/v1/stores/register')
          .field('storeName', validData.storeName)
          .field('businessType', validData.businessType)
          .field('shopAddress', validData.shopAddress)
          .field('billingAddress', validData.billingAddress)
          .field('ownerName', validData.ownerName)
          .field('pan', validData.pan)
          .field('bankAccountNumber', validData.bankAccountNumber)
          .field('ifsc', validData.ifsc)
          .field('kycAddress', validData.kycAddress)
          .field('contactEmail', validData.contactEmail)
          .field('contactPhone', validData.contactPhone)
          .expect(401);

        expect(response.body.status).toBe('error');
      });

      it('should reject invalid PAN format', async () => {
        const invalidData = {
          storeName: 'Test Store',
          businessType: 'individual',
          shopAddress: '123 Test Street, Test City, Test State 123456',
          billingAddress: '123 Test Street, Test City, Test State 123456',
          ownerName: 'John Doe',
          pan: 'INVALID',
          bankAccountNumber: '1234567890',
          ifsc: 'ABCD0123456',
          kycAddress: '123 Test Street, Test City, Test State 123456',
          contactEmail: 'contact@teststore.com',
          contactPhone: '9876543210'
        };

        const response = await request(app)
          .post('/api/v1/stores/register')
          .field('storeName', invalidData.storeName)
          .field('businessType', invalidData.businessType)
          .field('shopAddress', invalidData.shopAddress)
          .field('billingAddress', invalidData.billingAddress)
          .field('ownerName', invalidData.ownerName)
          .field('pan', invalidData.pan)
          .field('bankAccountNumber', invalidData.bankAccountNumber)
          .field('ifsc', invalidData.ifsc)
          .field('kycAddress', invalidData.kycAddress)
          .field('contactEmail', invalidData.contactEmail)
          .field('contactPhone', invalidData.contactPhone)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Validation failed');
      });

      it('should reject invalid IFSC format', async () => {
        const invalidData = {
          storeName: 'Test Store',
          businessType: 'individual',
          shopAddress: '123 Test Street, Test City, Test State 123456',
          billingAddress: '123 Test Street, Test City, Test State 123456',
          ownerName: 'John Doe',
          pan: 'ABCDE1234F',
          bankAccountNumber: '1234567890',
          ifsc: 'INVALID',
          kycAddress: '123 Test Street, Test City, Test State 123456',
          contactEmail: 'contact@teststore.com',
          contactPhone: '9876543210'
        };

        const response = await request(app)
          .post('/api/v1/stores/register')
          .field('storeName', invalidData.storeName)
          .field('businessType', invalidData.businessType)
          .field('shopAddress', invalidData.shopAddress)
          .field('billingAddress', invalidData.billingAddress)
          .field('ownerName', invalidData.ownerName)
          .field('pan', invalidData.pan)
          .field('bankAccountNumber', invalidData.bankAccountNumber)
          .field('ifsc', invalidData.ifsc)
          .field('kycAddress', invalidData.kycAddress)
          .field('contactEmail', invalidData.contactEmail)
          .field('contactPhone', invalidData.contactPhone)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Validation failed');
      });
    });
  });
}); 