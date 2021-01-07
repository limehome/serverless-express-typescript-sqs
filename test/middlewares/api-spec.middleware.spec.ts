import * as Express from 'express';
import * as request from 'supertest';
import { createHttpApp } from '../../src/http-app';
import * as ApiSpecMiddleware from '../../src/middlewares/api-spec.middleware';

describe('api spec middleware', () => {
  let app: Express.Express;
  beforeEach(() => {
    app = createHttpApp();
  });

  it('should send status 200 when accessing the apispec', async () => {
    const res = await request(app).get('/apispec/');
    expect(res.status).toBe(200);
  });
});
