import { eventService } from './services/event/index';
import { SQSEvent } from 'aws-lambda/trigger/sqs';

/**
 * Entry point for consumer that will be triggered from sqs events
 */
export const handler = (sqsEvent: SQSEvent) => eventService.handle(sqsEvent);
