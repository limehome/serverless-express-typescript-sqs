import { checkValidation } from './../middlewares/validator.middleware';
import { validateMessage } from './../validators/message.validator';
import * as Express from 'express';
import { messageController } from '../controllers/message';

export const messagesRouter = Express.Router();

messagesRouter.post(
  `/produce-message`,

  // Check the incoming message for errors
  validateMessage,

  // Handle the errors
  checkValidation,

  (req: Express.Request, res: Express.Response) =>
    messageController.produceMessage(req, res),
);
