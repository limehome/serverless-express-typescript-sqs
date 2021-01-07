import * as Express from 'express';
import * as request from 'supertest';
import { validateMessage } from '../../src/validators/message.validator';
import { checkValidation } from '../../src/middlewares/validator.middleware';
import { Response } from '../../src/interfaces/response.interface';
import { createMessageMock } from '../mock-factories/message.mock-factory';
import { json, urlencoded } from 'body-parser';

describe('message validator', () => {
  let app: Express.Express;
  beforeEach(() => {
    app = Express();
    app.use(json());
    app.use(urlencoded({ extended: true }));
    app.post(
      '/test',
      validateMessage,
      checkValidation,
      (req: Express.Request, res: Express.Response) =>
        res.status(200).send('success'),
    );
  });

  it('should send status 200 if message is valid', async () => {
    const res = await request(app).post('/test').send(createMessageMock());
    expect(res.status).toBe(200);
    expect((res.body as Response).errors).toBeUndefined();
  });

  it('should send status 400 if payload property is too short', async () => {
    const res = await request(app)
      .post('/test')
      .send(createMessageMock((m) => (m.payload = 'a')));
    expect(res.status).toBe(400);
    expect((res.body as Response).errors).toHaveLength(1);
  });

});
