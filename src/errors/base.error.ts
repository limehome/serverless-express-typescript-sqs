export class BaseError extends Error {
  constructor(error: unknown = {}) {
    super(JSON.stringify(error));
  }
}
