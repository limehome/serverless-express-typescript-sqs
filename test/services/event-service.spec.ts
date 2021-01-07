import { DequeuedMessage } from './../../.build/src/interfaces/dequeued-message.interface.d';
import { createMessageMock } from './../mock-factories/message.mock-factory';
import { SqsQueueService } from '../../src/services/queue/sqs-queue.service';
import { MaybeMockedDeep } from 'ts-jest/dist/utils/testing';
import { mocked } from 'ts-jest/utils';
import { NonRetriableError } from '../../src/errors/non-retriable.error';
import { PartialFailureError } from '../../src/errors/partial-failure.error';
import { SQSRecord } from 'aws-lambda';
import { EventService } from '../../src/services/event/event.service';
import { LogService } from '../../src/services/log/log.service';

jest.mock('../../src/services/queue/sqs-queue.service');
jest.mock('../../src/services/log/log.service');

describe('sqs message handler', () => {
  const fakeRecord = {
    messageId: 'someId',
    receiptHandle: 'someHandle',
    body: JSON.stringify(createMessageMock()),
  } as SQSRecord;

  let mockedSqsQueueService: MaybeMockedDeep<typeof SqsQueueService>;

  let eventService: EventService;
  let processMessageSpy: jest.SpyInstance;

  beforeEach(() => {
    mockedSqsQueueService = mocked(SqsQueueService, true);
    eventService = new EventService(
      new SqsQueueService(null as any),
      new LogService(),
    );

    processMessageSpy = jest.spyOn(eventService, 'processMessage');

    mockedSqsQueueService.prototype.deleteMessages.mockReset();
  });

  it('should finish successfully if all messages have been delivered', async () => {
    await eventService.handle({ Records: [fakeRecord] });
    expect(processMessageSpy).toHaveBeenCalledTimes(1);
    expect(
      mockedSqsQueueService.prototype.deleteMessages,
    ).toHaveBeenCalledTimes(0);
  });
  it('should skip non retriable errors', async () => {
    processMessageSpy.mockImplementationOnce(async () => {});
    processMessageSpy.mockImplementationOnce(async () => {
      throw new NonRetriableError('NoRetryNeeded');
    });
    await eventService.handle({ Records: [fakeRecord, fakeRecord] });
    expect(processMessageSpy).toHaveBeenCalledTimes(2);
    expect(
      mockedSqsQueueService.prototype.deleteMessages,
    ).toHaveBeenCalledTimes(0);
  });
  it('should delete successful and nonretriable messages and throw error on partial failure', async () => {
    const nonRetryMessageId = 'nonRetriableMessage';
    const retryMessageId = 'retryMessage';

    processMessageSpy.mockImplementationOnce(async () => {});
    processMessageSpy.mockImplementationOnce(async () => {
      throw new NonRetriableError('DoNotRetryMe');
    });
    processMessageSpy.mockImplementationOnce(async () => {
      throw new Error('RetryMe');
    });
    expect.assertions(3);
    try {
      await eventService.handle({
        Records: [
          fakeRecord,
          { ...fakeRecord, messageId: nonRetryMessageId },
          { ...fakeRecord, messageId: retryMessageId },
        ],
      });
    } catch (e) {
      expect(e).toBeInstanceOf(PartialFailureError);
    }

    expect(processMessageSpy).toHaveBeenCalledTimes(3);

    expect(mockedSqsQueueService.prototype.deleteMessages).toHaveBeenCalledWith(
      [
        {
          id: fakeRecord.messageId,
          receiptHandle: fakeRecord.receiptHandle,
          ...createMessageMock(),
        },
        {
          id: nonRetryMessageId,
          receiptHandle: fakeRecord.receiptHandle,
          ...createMessageMock(),
        },
      ] as DequeuedMessage[],
    );
  });
});
