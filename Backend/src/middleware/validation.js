import Joi from 'joi';

// Generic validation middleware
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown fields
      allowUnknown: false // Don't allow unknown fields
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return res.status(400).json({
        status: 'error',
        message: `Validation failed: ${errorMessage}`,
        data: null,
        validationErrors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Replace request data with validated data
    req[property] = value;
    next();
  };
};

// File validation middleware
export const validateFile = (options = {}) => {
  const {
    maxSize = 20 * 1024 * 1024, // 20MB default
    allowedTypes = ['application/pdf'],
    fieldName = 'file'
  } = options;

  return (req, res, next) => {
    // Check for file in req.file (single upload) or req.files (multiple upload)
    const file = req.file || (req.files && req.files[fieldName] && req.files[fieldName][0]);
    
    if (!file) {
      return res.status(400).json({
        status: 'error',
        message: `${fieldName} is required`,
        data: null
      });
    }

    // Check file size
    if (file.size > maxSize) {
      return res.status(400).json({
        status: 'error',
        message: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`,
        data: null
      });
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        status: 'error',
        message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        data: null
      });
    }

    next();
  };
}; 