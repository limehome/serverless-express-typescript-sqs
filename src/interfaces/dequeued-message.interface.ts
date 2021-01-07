import { QueuedMessage } from './queued-message.interface';
export interface DequeuedMessage extends QueuedMessage {
  receiptHandle: string;
}
