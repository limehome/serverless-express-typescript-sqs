import { createAwsSdkRequestMock } from './../mock-factories/aws-sdk.mock.factory';
import { DequeuedMessage } from './../../.build/src/interfaces/dequeued-message.interface.d';
import { QueuedMessage } from './../../src/interfaces/queued-message.interface';
import { SQS } from 'aws-sdk';
import { SqsQueueService } from '../../src/services/queue/sqs-queue.service';
import { createMessageMock } from '../mock-factories/message.mock-factory';
import { MESSAGE_QUEUE_URL } from '../../src/constants/environment.constants';

describe('sqs queue service', () => {
  let sqsQueueService: SqsQueueService;
  let mockedSqsClient: jest.Mocked<SQS>;
  beforeAll(() => {
    mockedSqsClient = {
      sendMessage: jest.fn(() => {}),
      deleteMessage: jest.fn(() => {}),
      deleteMessageBatch: jest.fn(() => {}),
    } as any;
    sqsQueueService = new SqsQueueService(mockedSqsClient);
  });

  describe('enqueueMessage', () => {
    it('should enqueue a message', async () => {
      const messageId = 'test';
      const message = createMessageMock();

      mockedSqsClient.sendMessage.mockReturnValue(
        createAwsSdkRequestMock<SQS.SendMessageResult>({
          MessageId: messageId,
        }),
      );
      const result = await sqsQueueService.enqueueMessage(message);
      expect(result).toMatchObject({
        ...message,
        id: messageId,
      } as QueuedMessage);
      expect(mockedSqsClient.sendMessage).toHaveBeenCalledWith({
        QueueUrl: MESSAGE_QUEUE_URL,
        MessageBody: JSON.stringify(message),
      } as SQS.SendMessageRequest);
    });
  });

  describe('deleteMessages', () => {
    it('should delete messages', async () => {
      const messageHeaders: DequeuedMessage[] = [
        {
          id: 'testId',
          receiptHandle: 'testHandle',
          ...createMessageMock(),
        },
      ];

      mockedSqsClient.deleteMessageBatch.mockReturnValue(
        createAwsSdkRequestMock({
          Successful: [],
          Failed: [],
        }),
      );
      await sqsQueueService.deleteMessages(messageHeaders);
      expect(mockedSqsClient.deleteMessageBatch).toHaveBeenCalledWith({
        QueueUrl: MESSAGE_QUEUE_URL,
        Entries: messageHeaders.map((m) => ({
          Id: m.id,
          ReceiptHandle: m.receiptHandle,
        })),
      } as SQS.DeleteMessageBatchRequest);
      mockedSqsClient.deleteMessageBatch.mockReset();
    });

    it('should throw error if there are failed entries', async () => {
      const messageHeaders: DequeuedMessage[] = [
        {
          id: 'testId',
          receiptHandle: 'testHandle',
          ...createMessageMock(),
        },
      ];

      mockedSqsClient.deleteMessageBatch.mockReturnValue(
        createAwsSdkRequestMock({
          Successful: [],
          Failed: [{ Id: '', SenderFault: true, Code: '' }],
        }),
      );
      expect(sqsQueueService.deleteMessages(messageHeaders)).rejects.toThrow(
        Error,
      );
      mockedSqsClient.deleteMessageBatch.mockReset();
    });

    it('should delete no messages if input array is empty', async () => {
      await sqsQueueService.deleteMessages([]);
      expect(mockedSqsClient.deleteMessageBatch).toHaveBeenCalledTimes(0);
      mockedSqsClient.deleteMessageBatch.mockReset();
    });
  });
});
