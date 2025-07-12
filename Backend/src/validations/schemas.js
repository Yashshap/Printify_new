import Joi from 'joi';

// Common patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[6-9]\d{9}$/; // Indian mobile numbers
const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// User registration schema
export const userRegistrationSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'First name can only contain letters and spaces',
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters'
    }),
  
  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Last name can only contain letters and spaces',
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
  
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(emailPattern)
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.pattern.base': 'Please enter a valid email address'
    }),
  
  mobile: Joi.string()
    .pattern(phonePattern)
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit mobile number'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    })
});

// User login schema
export const userLoginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(emailPattern)
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.pattern.base': 'Please enter a valid email address'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })
});

// User profile update schema
export const userProfileUpdateSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'First name can only contain letters and spaces',
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters'
    }),
  
  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Last name can only contain letters and spaces',
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
  
  mobile: Joi.string()
    .pattern(phonePattern)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit mobile number'
    })
});

// Order creation schema
export const orderCreationSchema = Joi.object({
  storeId: Joi.string()
    .pattern(/^SHP_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid store ID format',
      'any.required': 'Store ID is required'
    }),
  
  colorMode: Joi.string()
    .valid('color', 'black_white')
    .required()
    .messages({
      'any.only': 'Color mode must be either "color" or "black_white"',
      'any.required': 'Color mode is required'
    }),
  
  pageRange: Joi.string()
    .pattern(/^(all|\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*)$/)
    .required()
    .messages({
      'string.pattern.base': 'Page range must be "all" or a valid range (e.g., "1-5", "1,3,5", "1-3,5-7")',
      'any.required': 'Page range is required'
    }),
  
  paymentStatus: Joi.string()
    .valid('pending', 'paid', 'failed')
    .default('pending')
    .messages({
      'any.only': 'Payment status must be pending, paid, or failed'
    }),
  
  paymentMethod: Joi.string()
    .valid('online', 'offline')
    .default('online')
    .messages({
      'any.only': 'Payment method must be online or offline'
    }),
  
  discount: Joi.number()
    .min(0)
    .max(100)
    .default(0)
    .messages({
      'number.min': 'Discount cannot be negative',
      'number.max': 'Discount cannot exceed 100%'
    })
});

// Store registration schema
export const storeRegistrationSchema = Joi.object({
  storeName: Joi.string()
    .min(3)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-_&.]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Store name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands',
      'string.min': 'Store name must be at least 3 characters long',
      'string.max': 'Store name cannot exceed 100 characters'
    }),
  
  businessName: Joi.string()
    .min(3)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-_&.]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Business name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands',
      'string.min': 'Business name must be at least 3 characters long',
      'string.max': 'Business name cannot exceed 100 characters'
    }),
  
  businessType: Joi.string()
    .valid('individual', 'partnership', 'corporation', 'llc', 'other')
    .required()
    .messages({
      'any.only': 'Business type must be individual, partnership, corporation, llc, or other',
      'any.required': 'Business type is required'
    }),
  
  taxId: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid GST number'
    }),
  
  shopAddress: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.min': 'Shop address must be at least 10 characters long',
      'string.max': 'Shop address cannot exceed 500 characters',
      'any.required': 'Shop address is required'
    }),
  
  supportPhone: Joi.string()
    .pattern(phonePattern)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit phone number'
    }),
  
  bankInfo: Joi.string()
    .min(5)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Bank info must be at least 5 characters long',
      'string.max': 'Bank info cannot exceed 200 characters'
    }),
  
  billingAddress: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.min': 'Billing address must be at least 10 characters long',
      'string.max': 'Billing address cannot exceed 500 characters',
      'any.required': 'Billing address is required'
    }),
  
  // KYC fields
  ownerName: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Owner name can only contain letters and spaces',
      'string.min': 'Owner name must be at least 2 characters long',
      'string.max': 'Owner name cannot exceed 100 characters',
      'any.required': 'Owner name is required'
    }),
  
  pan: Joi.string()
    .pattern(panPattern)
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid PAN number',
      'any.required': 'PAN is required'
    }),
  
  bankAccountNumber: Joi.string()
    .pattern(/^[0-9]{9,18}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid bank account number (9-18 digits)',
      'any.required': 'Bank account number is required'
    }),
  
  ifsc: Joi.string()
    .pattern(ifscPattern)
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid IFSC code',
      'any.required': 'IFSC code is required'
    }),
  
  gstNumber: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid GST number'
    }),
  
  kycAddress: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.min': 'KYC address must be at least 10 characters long',
      'string.max': 'KYC address cannot exceed 500 characters',
      'any.required': 'KYC address is required'
    }),
  
  contactEmail: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(emailPattern)
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.pattern.base': 'Please enter a valid email address',
      'any.required': 'Contact email is required'
    }),
  
  contactPhone: Joi.string()
    .pattern(phonePattern)
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit phone number',
      'any.required': 'Contact phone is required'
    })
});

// Query parameters for orders
export const orderQuerySchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'processing', 'completed', 'cancelled')
    .optional()
    .messages({
      'any.only': 'Status must be pending, processing, completed, or cancelled'
    }),
  
  skip: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Skip must be a number',
      'number.integer': 'Skip must be an integer',
      'number.min': 'Skip cannot be negative'
    }),
  
  take: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Take must be a number',
      'number.integer': 'Take must be an integer',
      'number.min': 'Take must be at least 1',
      'number.max': 'Take cannot exceed 100'
    })
}); 