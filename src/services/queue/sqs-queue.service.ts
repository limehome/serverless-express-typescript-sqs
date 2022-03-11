import { DequeuedMessage } from './../../interfaces/dequeued-message.interface';
import { QueuedMessage } from './../../interfaces/queued-message.interface';
import { MESSAGE_QUEUE_URL } from './../../constants/environment.constants';
import { Message } from './../../interfaces/message.interface';
import { SQS } from 'aws-sdk';
import { QueueService } from '../../interfaces/queue-service.interface';

/**
 * Service to handle different sqs queue actions
 */
export class SqsQueueService implements QueueService {
  constructor(private readonly sqsClient: SQS) {}

  /**
   * Enqueue a message to the sqs queue
   */
  async enqueueMessage(message: Message): Promise<QueuedMessage> {
    const result = await this.sqsClient
      .sendMessage({
        QueueUrl: MESSAGE_QUEUE_URL,
        MessageBody: JSON.stringify(message),
      })
      .promise();

    return {
      id: result.MessageId || '',
      ...message,
    };
  }

  /**
   * Deletes up to ten messages from a sqs queue
   */
  async deleteMessages(
    deleteMessageRequests: DequeuedMessage[],
  ): Promise<void> {
    if (deleteMessageRequests.length <= 0) {
      return;
    }

    const result = await this.sqsClient
      .deleteMessageBatch({
        QueueUrl: MESSAGE_QUEUE_URL,
        Entries: deleteMessageRequests.map((m) => ({
          Id: m.id,
          ReceiptHandle: m.receiptHandle,
        })),
      })
      .promise();

    if (result.Failed.length > 0) {
      throw new Error('Unable to delete messages from queue.');
    }
  }
}
