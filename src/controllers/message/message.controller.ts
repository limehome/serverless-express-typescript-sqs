import { QueueService } from './../../interfaces/queue-service.interface';
import { Response } from './../../interfaces/response.interface';
import { Message } from '../../interfaces/message.interface';
import * as Express from 'express';
import { QueuedMessage } from 'src/interfaces/queued-message.interface';

/**
 * Controller to produce new messages for the sqs queue
 */
export class MessageController {
  constructor(private readonly queueService: QueueService) {}

  public async produceMessage(req: Express.Request, res: Express.Response) {
    const message: Message = req.body;
    const queuedMessage = await this.queueService.enqueueMessage(message);
    res.status(200).send({
      message: 'Produced message',
      payload: queuedMessage,
    } as Response<QueuedMessage>);
  }
}
