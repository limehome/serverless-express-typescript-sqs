import * as Express from 'express';
import { NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Response } from '../interfaces/response.interface';

/**
 * Checks if there are validation errors.
 * Send a 400 response if errors do exist
 */
export const checkValidation = (
  req: Express.Request,
  res: Express.Response,
  next: NextFunction,
) => {
  // Check if there are any validation errors
  const validationErrors = validationResult(req);

  // Go to next middleware if there are no errors
  if (validationErrors.isEmpty()) {
    next();
    return;
  }

  // Map errors to your format
  let errors = validationErrors
    .array()
    .map((error) => `${error.location} -> ${error.param}: ${error.msg}`);

  res.status(400).send({
    message: 'There are validation errors',
    errors,
  } as Response);
};
