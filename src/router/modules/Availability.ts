import { AvailabilityCalendarController } from "./../../controllers/AvailabilityCalendarController";
import { AvailabilityController } from "./../../controllers/AvailabilityController";
import Router from "@koa/router";
import { getCapabilities } from "../common";
import {
  AvailabilityCalendarBodySchema,
  availabilityCalendarBodySchema,
  availabilityBodySchema,
  AvailabilityBodySchema,
} from "@octocloud/types";

export const availabilityRouter = new Router();

const availabilityController = new AvailabilityController();
const availabilityCalendarController = new AvailabilityCalendarController();

availabilityRouter.post("/availability", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  const data: AvailabilityBodySchema = ctx.request.body;
  await availabilityBodySchema.validate(data);
  const schema = availabilityBodySchema.cast(data) as AvailabilityBodySchema;

  const body = await availabilityController.getAvailability(
    schema,
    capabilities
  );

  ctx.body = body;
  ctx.toJSON();
});

availabilityRouter.post("/availability/calendar", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  const data: AvailabilityCalendarBodySchema = ctx.request.body;

  await availabilityCalendarBodySchema.validate(data);
  const schema = availabilityCalendarBodySchema.cast(
    data
  ) as AvailabilityCalendarBodySchema;

  const body = await availabilityCalendarController.getAvailability(
    schema,
    capabilities
  );

  ctx.body = body;
  ctx.toJSON();
});
