require('express-async-errors');
import { messagesRouter } from './routers/message.router';
import { useApiSpec } from './middlewares/api-spec.middleware';
import * as Express from 'express';
import * as cors from 'cors';
import { json, urlencoded } from 'body-parser';
import { handleErrors } from './middlewares/error.middleware';

/**
 * Creates an Express.js http app which contains endpoints
 * to produce messages for the sqs queue
 */
export const createHttpApp = () => {
  const app = Express();
  app.use(cors());
  app.use(json());
  app.use(urlencoded({ extended: true }));

  // setup swagger
  useApiSpec(app);

  // setup routers
  app.use('/', messagesRouter);

  // setup handler for unexpected errors
  app.use(handleErrors);

  return app;
};
