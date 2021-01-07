import { handleErrors } from './../../src/middlewares/error.middleware';
import {
  createRequestMock,
  createResponseMock,
  createNextMock,
} from '../mock-factories/express.mock-factory';

describe('error middleware', () => {
  it('should send status 500', async () => {
    const req = createRequestMock();
    const res = createResponseMock();
    const next = createNextMock();

    const error = 'test-error';

    handleErrors(error, req, res, next);

    expect(next).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
