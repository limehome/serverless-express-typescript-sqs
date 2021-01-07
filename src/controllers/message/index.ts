import { queueService } from './../../services/queue';
import { MessageController } from './message.controller';

export const messageController = new MessageController(queueService);
