import * as SwaggerUI from 'swagger-ui-express';
import { safeLoad } from 'js-yaml';
import { Express } from 'express';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ServerlessApplicationRepository } from 'aws-sdk';

let swaggerSpec: object;

/**
 * Load and parse yaml file that contains the swagger specification
 */
const loadSpec = () =>
  safeLoad(
    readFileSync(resolve(__dirname, '../../docs/api-spec.yml'), 'utf-8'),
  ) as object;

/**
 * Serves a swagger doc under /apispec
 */
export const useApiSpec = (app: Express) => {
  if (!swaggerSpec) {
    swaggerSpec = loadSpec();
  }

  const swaggerUIMiddleware = SwaggerUI.setup(swaggerSpec);

  // Make a mock request to the swagger ui middleware to initialize it.
  // Otherwise some js files will not be loaded with serverless
  // Workaround issue: https://github.com/scottie1984/swagger-ui-express/issues/178
  swaggerUIMiddleware({} as any, { send: () => {} } as any, () => {});

  app.use(
    `/apispec`,
    SwaggerUI.serveWithOptions({
      redirect: false, // Disabled as it does not work with API gateway
    }),
  );
  app.get(`/apispec/`, swaggerUIMiddleware);
};
