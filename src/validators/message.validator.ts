import { body } from 'express-validator';

// Sets the validation constrains for a message
// Add more items to validate multiple properties
export const validateMessage = [
  body('payload').isString().isLength({ min: 2, max: 1000 }),
];
