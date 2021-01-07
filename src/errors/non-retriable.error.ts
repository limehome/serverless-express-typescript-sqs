import { BaseError } from './base.error';

/**
 * Throw this error if message should not stay in the queue when error occurs
 */
export class NonRetriableError extends BaseError {}
