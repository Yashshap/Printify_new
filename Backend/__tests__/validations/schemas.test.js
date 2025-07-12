import Joi from 'joi';
import {
  userRegistrationSchema,
  userLoginSchema,
  userProfileUpdateSchema,
  orderCreationSchema,
  storeRegistrationSchema,
  orderQuerySchema
} from '../../src/validations/schemas.js';

describe('Validation Schemas', () => {
  describe('User Registration Schema', () => {
    const validUserData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      mobile: '9876543210',
      password: 'TestPass123!'
    };

    it('should validate correct user registration data', () => {
      const { error } = userRegistrationSchema.validate(validUserData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email format', () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };
      const { error } = userRegistrationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid email address');
    });

    it('should reject invalid mobile number', () => {
      const invalidData = { ...validUserData, mobile: '123456789' };
      const { error } = userRegistrationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid 10-digit mobile number');
    });

    it('should reject weak password', () => {
      const invalidData = { ...validUserData, password: 'weak' };
      const { error } = userRegistrationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 8 characters long');
    });

    it('should reject names with numbers', () => {
      const invalidData = { ...validUserData, firstName: 'John123' };
      const { error } = userRegistrationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('letters and spaces');
    });

    it('should reject missing required fields', () => {
      const { error } = userRegistrationSchema.validate({});
      expect(error).toBeDefined();
      expect(error.details.length).toBeGreaterThan(0);
    });
  });

  describe('User Login Schema', () => {
    const validLoginData = {
      email: 'john.doe@example.com',
      password: 'password123'
    };

    it('should validate correct login data', () => {
      const { error } = userLoginSchema.validate(validLoginData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email', () => {
      const invalidData = { ...validLoginData, email: 'invalid-email' };
      const { error } = userLoginSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject empty password', () => {
      const invalidData = { ...validLoginData, password: '' };
      const { error } = userLoginSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('User Profile Update Schema', () => {
    const validProfileData = {
      firstName: 'John',
      lastName: 'Doe',
      mobile: '9876543210'
    };

    it('should validate correct profile data', () => {
      const { error } = userProfileUpdateSchema.validate(validProfileData);
      expect(error).toBeUndefined();
    });

    it('should allow partial updates', () => {
      const partialData = { firstName: 'John' };
      const { error } = userProfileUpdateSchema.validate(partialData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid mobile number', () => {
      const invalidData = { ...validProfileData, mobile: '123' };
      const { error } = userProfileUpdateSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('Order Creation Schema', () => {
    const validOrderData = {
      storeId: 'SHP_550e8400-e29b-41d4-a716-446655440000',
      colorMode: 'color',
      pageRange: '1-5',
      paymentStatus: 'pending',
      paymentMethod: 'online',
      discount: 0
    };

    it('should validate correct order data', () => {
      const { error } = orderCreationSchema.validate(validOrderData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid store ID format', () => {
      const invalidData = { ...validOrderData, storeId: 'INVALID_ID' };
      const { error } = orderCreationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Invalid store ID format');
    });

    it('should reject invalid color mode', () => {
      const invalidData = { ...validOrderData, colorMode: 'invalid' };
      const { error } = orderCreationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('color" or "black_white"');
    });

    it('should validate different page range formats', () => {
      const validRanges = ['all', '1-5', '1,3,5', '1-3,5-7'];
      
      validRanges.forEach(range => {
        const data = { ...validOrderData, pageRange: range };
        const { error } = orderCreationSchema.validate(data);
        expect(error).toBeUndefined();
      });
    });

    it('should reject invalid page range', () => {
      const invalidData = { ...validOrderData, pageRange: 'invalid' };
      const { error } = orderCreationSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject negative discount', () => {
      const invalidData = { ...validOrderData, discount: -10 };
      const { error } = orderCreationSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject discount over 100%', () => {
      const invalidData = { ...validOrderData, discount: 150 };
      const { error } = orderCreationSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should use default values', () => {
      const minimalData = {
        storeId: validOrderData.storeId,
        colorMode: validOrderData.colorMode,
        pageRange: validOrderData.pageRange
      };
      const { value } = orderCreationSchema.validate(minimalData);
      expect(value.paymentStatus).toBe('pending');
      expect(value.paymentMethod).toBe('online');
      expect(value.discount).toBe(0);
    });
  });

  describe('Store Registration Schema', () => {
    const validStoreData = {
      storeName: 'Test Store',
      businessName: 'Test Business',
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

    it('should validate correct store data', () => {
      const { error } = storeRegistrationSchema.validate(validStoreData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid PAN format', () => {
      const invalidData = { ...validStoreData, pan: 'INVALID' };
      const { error } = storeRegistrationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid PAN number');
    });

    it('should reject invalid IFSC format', () => {
      const invalidData = { ...validStoreData, ifsc: 'INVALID' };
      const { error } = storeRegistrationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid IFSC code');
    });

    it('should reject invalid bank account number', () => {
      const invalidData = { ...validStoreData, bankAccountNumber: '123' };
      const { error } = storeRegistrationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid bank account number');
    });

    it('should reject invalid business type', () => {
      const invalidData = { ...validStoreData, businessType: 'invalid' };
      const { error } = storeRegistrationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('individual, partnership, corporation, llc, or other');
    });

    it('should validate optional GST number', () => {
      const dataWithGst = { ...validStoreData, gstNumber: '12ABCDE1234F1Z5' };
      const { error } = storeRegistrationSchema.validate(dataWithGst);
      expect(error).toBeUndefined();
    });

    it('should reject invalid GST number', () => {
      const invalidData = { ...validStoreData, gstNumber: 'INVALID' };
      const { error } = storeRegistrationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid GST number');
    });

    it('should reject short addresses', () => {
      const invalidData = { ...validStoreData, shopAddress: 'Short' };
      const { error } = storeRegistrationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 10 characters long');
    });
  });

  describe('Order Query Schema', () => {
    const validQueryData = {
      status: 'pending',
      skip: 0,
      take: 20
    };

    it('should validate correct query data', () => {
      const { error } = orderQuerySchema.validate(validQueryData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid status', () => {
      const invalidData = { ...validQueryData, status: 'invalid' };
      const { error } = orderQuerySchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject negative skip', () => {
      const invalidData = { ...validQueryData, skip: -1 };
      const { error } = orderQuerySchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject take over 100', () => {
      const invalidData = { ...validQueryData, take: 150 };
      const { error } = orderQuerySchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should use default values', () => {
      const { value } = orderQuerySchema.validate({});
      expect(value.skip).toBe(0);
      expect(value.take).toBe(20);
    });
  });
}); 