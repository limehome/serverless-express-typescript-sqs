import { Request, Response } from 'express';

export const createRequestMock = (
  request: Partial<Request> = {},
): jest.Mocked<Request> => {
  return {
    url: 'http://localhost',
    method: 'get',
    header: jest.fn(),
    query: {},
    params: {},
    ...request,
  } as any;
};

export const createResponseMock = (
  response: Partial<Response> = {},
): jest.Mocked<Response> => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    ...response,
  } as any;
};

export const createNextMock = () => jest.fn(() => {});
