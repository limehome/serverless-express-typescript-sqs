import { EventService } from './event.service';
import { queueService } from '../queue';
import { logService } from '../log';

export const eventService = new EventService(queueService, logService);
