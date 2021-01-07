import { createServer, proxy } from 'aws-serverless-express';
import { Context, APIGatewayProxyEvent } from 'aws-lambda';
import { createHttpApp } from './http-app';

const httpApp = createHttpApp();
const httpServer = createServer(httpApp);

/**
 * Entry point for the http producer for serverless
 */
export const handler = (event: APIGatewayProxyEvent, context: Context) =>
  proxy(httpServer, event, context, 'PROMISE').promise;
