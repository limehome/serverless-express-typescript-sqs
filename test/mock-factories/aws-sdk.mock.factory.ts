import { AWSError, Request } from 'aws-sdk';

export const createAwsSdkRequestMock = <T>(
  response: T,
): Request<T, AWSError> => {
  return {
    promise: async () => response,
  } as any;
};
