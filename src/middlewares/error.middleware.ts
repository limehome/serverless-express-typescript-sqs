import { Response } from './../interfaces/response.interface';
import * as Express from 'express';

/**
 * Handles unexpected errors that have not been handled by any controller
 */
export const handleErrors = (
  error: unknown,
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,
) => {
  // Transform or check any unexpected errors
  return res.status(500).send({
    message: 'An unexpected error occured.',
  } as Response);
};
