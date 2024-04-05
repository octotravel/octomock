import Router from '@koa/router';
import {
  AvailabilityCalendarBodySchema,
  availabilityCalendarBodySchema,
  availabilityBodySchema,
  AvailabilityBodySchema,
} from '@octocloud/types';
import { AvailabilityCalendarController } from '../../controllers/AvailabilityCalendarController';
import { AvailabilityController } from '../../controllers/AvailabilityController';
import { getCapabilities } from '../common';

export const availabilityRouter = new Router();

const availabilityController = new AvailabilityController();
const availabilityCalendarController = new AvailabilityCalendarController();

availabilityRouter.post('/availability', async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  const data: AvailabilityBodySchema = ctx.request.body;
  await availabilityBodySchema.validate(data);
  const schema = availabilityBodySchema.cast(data) as AvailabilityBodySchema;

  // TODO proper fix (Probably set correct TZ in env and use it)
  if (schema.localDate !== undefined) {
    schema.localDate = schema.localDate.split('T')[0];
  }

  if (schema.localDateStart !== undefined) {
    schema.localDateStart = schema.localDateStart.split('T')[0];
  }

  if (schema.localDateEnd !== undefined) {
    schema.localDateEnd = schema.localDateEnd.split('T')[0];
  }

  const body = await availabilityController.getAvailability(schema, capabilities);

  ctx.body = body;
  ctx.toJSON();
});

availabilityRouter.post('/availability/calendar', async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  const data: AvailabilityCalendarBodySchema = ctx.request.body;

  await availabilityCalendarBodySchema.validate(data);
  const schema = availabilityCalendarBodySchema.cast(data) as AvailabilityCalendarBodySchema;

  const body = await availabilityCalendarController.getAvailability(schema, capabilities);

  ctx.body = body;
  ctx.toJSON();
});
