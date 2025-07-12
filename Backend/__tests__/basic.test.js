import { userRegistrationSchema } from '../src/validations/schemas.js';

describe('Basic Validation Test', () => {
  it('should validate correct user registration data', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      mobile: '9876543210',
      password: 'TestPass123!'
    };

    const { error } = userRegistrationSchema.validate(validData);
    expect(error).toBeUndefined();
  });

  it('should reject invalid email format', () => {
    const invalidData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email',
      mobile: '9876543210',
      password: 'TestPass123!'
    };

    const { error } = userRegistrationSchema.validate(invalidData);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('valid email address');
  });
}); 