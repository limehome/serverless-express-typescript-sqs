import { QueueService } from './../../interfaces/queue-service.interface';
import { QueuedMessage } from 'src/interfaces/queued-message.interface';
import { Message } from 'src/interfaces/message.interface';
import { DequeuedMessage } from 'src/interfaces/dequeued-message.interface';
import { LogService } from '../log/log.service';

/**
 * This class provides a mock implementation of QueueService.
 * Instead of performing actions with a real sqs queue, the action just gets logged.
 */
export class LocalQueueService implements QueueService {
  constructor(private readonly logService: LogService) {}

  /**
   * Logs a that message got enqueded
   */
  async enqueueMessage(message: Message): Promise<QueuedMessage> {
    this.logService.info(
      LocalQueueService.name,
      'Enqueued message to fake sqs queue. Message:',
      message,
    );

    return {
      id: 'local-id',
      ...message,
    };
  }

  /**
   * Logs a that messages got deleted
   */
  async deleteMessages(messageHeaders: DequeuedMessage[]): Promise<void> {
    this.logService.info(
      LocalQueueService.name,
      'Deleted messages from fake sqs queue. Deleted messages:',
      messageHeaders,
    );
  }
}
