import { QueuedMessage } from 'src/interfaces/queued-message.interface';
import { Message } from './message.interface';
import { DequeuedMessage } from './dequeued-message.interface';

export interface QueueService {
  enqueueMessage(message: Message): Promise<QueuedMessage>;
  deleteMessages(messageHeaders: DequeuedMessage[]): Promise<void>;
}
