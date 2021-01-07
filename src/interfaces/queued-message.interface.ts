import { Message } from './message.interface';
export interface QueuedMessage extends Message {
  id: string;
}
