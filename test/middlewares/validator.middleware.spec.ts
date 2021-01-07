import {
  createRequestMock,
  createResponseMock,
  createNextMock,
} from '../mock-factories/express.mock-factory';
import { body } from 'express-validator';
import { checkValidation } from '../../src/middlewares/validator.middleware';

describe('validator middleware', () => {
  it('should send status 400 if there are validation errors and map errors correctly', async () => {
    const req = createRequestMock();
    const res = createResponseMock();
    const next = createNextMock();

    req.body = {
      payload: 1,
    };

    await body('payload').isString().run(req);

    checkValidation(req, res, next);

    expect(next).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send.mock.calls[0][0].errors).toMatchObject([
      'body -> payload: Invalid value',
    ]);
  });

  it('should call next if there are no validation erros', async () => {
    const req = createRequestMock();
    const res = createResponseMock();
    const next = createNextMock();

    req.body = {
      payload: 'valid',
    };

    await body('payload').isString().run(req);

    checkValidation(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
