// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.RAZORPAY_KEY_ID = 'test-key-id';
process.env.RAZORPAY_KEY_SECRET = 'test-key-secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test-webhook-secret';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.AWS_S3_BUCKET = 'test-bucket';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/printify_test';

// Mock AWS SDK
jest.mock('aws-sdk', () => ({
  S3: jest.fn().mockImplementation(() => ({
    upload: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({ Location: 'https://test-bucket.s3.amazonaws.com/test-file.pdf' })
    }),
    getSignedUrlPromise: jest.fn().mockResolvedValue('https://test-signed-url.com'),
    deleteObject: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    })
  }))
}));

// Mock Razorpay
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({ id: 'order_test123', amount: 1000, currency: 'INR' })
    },
    payments: {
      fetch: jest.fn().mockResolvedValue({ id: 'pay_test123', status: 'captured' })
    },
    transfers: {
      create: jest.fn().mockResolvedValue({ id: 'transfer_test123' })
    },
    accounts: {
      create: jest.fn().mockResolvedValue({ id: 'account_test123', kyc: { status: 'pending' } })
    }
  }));
});

// Global test timeout
setTimeout(() => {}, 10000); 