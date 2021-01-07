import { Message } from '../../interfaces/message.interface';
import { QueueService } from './../../interfaces/queue-service.interface';
import { PartialFailureError } from './../../errors/partial-failure.error';
import { NonRetriableError } from './../../errors/non-retriable.error';
import { DequeuedMessage } from './../../interfaces/dequeued-message.interface';
import { SQSEvent } from 'aws-lambda/trigger/sqs';
import { LogService } from '../log/log.service';

export class EventService {
  constructor(
    private readonly queueService: QueueService,
    private readonly logService: LogService,
  ) {}

  /**
   * Handles an sqs event by processing every message of it
   */
  async handle(event: SQSEvent) {
    // Get parsed messages from the event
    const dequeuedMessages = this.mapEventToDequeuedMessages(event);
    const messagesToDelete: DequeuedMessage[] = [];

    // Process all messages
    // To delete every message from the event from the queue that has been successful processed,
    // the handle function must not throw an error.
    // To delete successful messages and keep unsuccessful messages in the queue,
    // the handle function has to throw an error.
    // Successfull messages have to be deleted manually in this case.
    const promises = dequeuedMessages.map(async (message) => {
      try {
        await this.processMessage(message);
        messagesToDelete.push(message);
      } catch (error) {
        if (error instanceof NonRetriableError) {
          messagesToDelete.push(message);
          this.logService.error(
            EventService.name,
            'Processing message',
            message,
            'caused a non retriable error. Error:',
            error,
          );
        } else {
          this.logService.error(
            EventService.name,
            'Processing message',
            message,
            'caused a retriable error. Error:',
            error,
          );
        }
      }
    });
    // await until all messages have been processed
    await Promise.all(promises);

    // Delete successful messages manually if other processings failed
    const numRetriableMessages =
      dequeuedMessages.length - messagesToDelete.length;
    if (numRetriableMessages > 0) {
      await this.queueService.deleteMessages(messagesToDelete);

      const errorMessage = `Failing due to ${numRetriableMessages} unsuccessful and retriable errors.`;

      throw new PartialFailureError(errorMessage);
    }
  }

  async processMessage(message: DequeuedMessage) {
    // Here you can process the message.
    // For example you could send this message to another http api.
    // If processing of the message fails
    // and you want that this process should be not retried for this specific case, throw a NonRetriableError
    // otherwise throw any other error to leave the message in the sqs queue.
    this.logService.info(
      EventService.name,
      'Processed message',
      message,
      'successfully.',
    );
  }

  private mapEventToDequeuedMessages(event: SQSEvent): DequeuedMessage[] {
    return event.Records.map((record) => {
      const message: Message = JSON.parse(record.body);
      return {
        id: record.messageId,
        receiptHandle: record.receiptHandle,
        ...message,
      };
    });
  }
}
