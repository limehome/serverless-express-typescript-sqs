import { createMessageMock } from './../mock-factories/message.mock-factory';
import { MessageController } from '../../src/controllers/message/message.controller';
import { QueuedMessage } from '../../src/interfaces/queued-message.interface';
import {
  createRequestMock,
  createResponseMock,
} from '../mock-factories/express.mock-factory';
import { MaybeMockedDeep, mocked } from 'ts-jest/dist/utils/testing';
import { SqsQueueService } from '../../src/services/queue/sqs-queue.service';

jest.mock('../../src/services/queue/sqs-queue.service');

describe('message controller', () => {
  let mockedQueueService: MaybeMockedDeep<typeof SqsQueueService>;
  let messageController: MessageController;

  const TEST_ID = 'test-id';

  beforeAll(() => {
    mockedQueueService = mocked(SqsQueueService, true);

    mockedQueueService.prototype.enqueueMessage.mockImplementation(
      async (message): Promise<QueuedMessage> => ({
        ...message,
        id: TEST_ID,
      }),
    );

    messageController = new MessageController(new SqsQueueService(null as any));
  });

  describe('produceMessage', () => {
    it('should call queue service with correct arguments', async () => {
      const message = createMessageMock();
      const req = createRequestMock({ body: message });
      const res = createResponseMock();

      await messageController.produceMessage(req, res);

      expect(mockedQueueService.prototype.enqueueMessage).toHaveBeenCalledWith(
        message,
      );
    });

    it('should send queued message with status 200', async () => {
      const message = createMessageMock();
      const req = createRequestMock({ body: message });
      const res = createResponseMock();

      await messageController.produceMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send.mock.calls[0][0].payload).toMatchObject({
        ...message,
        id: TEST_ID,
      } as QueuedMessage);
    });
  });
});
