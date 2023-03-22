import Router from "@koa/router";
import {
  cancelBookingBodySchema,
  confirmBookingBodySchema,
  extendBookingBodySchema,
  updateBookingBodySchema,
} from "@octocloud/types";
import { BookingController } from "../../controllers/BookingController";
import { getCapabilities } from "../common";
import {
  getBookingSchema,
  GetBookingSchema,
  GetBookingsSchema,
  getBookingsSchema,
  cancelBookingSchema,
  confirmBookingSchema,
  extendBookingSchema,
  updateBookingSchema,
  createBookingSchema,
  CreateBookingSchema,
  CancelBookingSchema,
  ExtendBookingSchema,
  UpdateBookingSchema,
  ConfirmBookingSchema,
} from "../../schemas/Booking";

export const bookingRouter = new Router();

const bookingController = new BookingController();

bookingRouter.post("/bookings", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const data: CreateBookingSchema = ctx.request.body;
  await createBookingSchema.validate(data);
  const schema = createBookingSchema.cast(data) as CreateBookingSchema;
  const booking = await bookingController.createBooking(schema, capabilities);
  ctx.body = booking;
  ctx.toJSON();
});

bookingRouter.post("/bookings/:uuid/confirm", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  await confirmBookingBodySchema.validate(ctx.request.body);
  const reqBody = confirmBookingBodySchema.cast(ctx.request.body);

  const data = {
    ...reqBody,
    uuid: ctx.params.uuid,
  };

  await confirmBookingSchema.validate(data);
  const schema = confirmBookingSchema.cast(data) as ConfirmBookingSchema;
  const booking = await bookingController.confirmBooking(schema, capabilities);
  ctx.body = booking;
  ctx.toJSON();
});

bookingRouter.patch("/bookings/:uuid", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  await updateBookingBodySchema.validate(ctx.request.body);
  const reqBody = updateBookingBodySchema.cast(ctx.request.body);

  const data = {
    ...reqBody,
    uuid: ctx.params.uuid,
  };

  await updateBookingSchema.validate(data);
  const schema = updateBookingSchema.cast(data) as UpdateBookingSchema;
  const booking = await bookingController.updateBooking(schema, capabilities);
  ctx.body = booking;
  ctx.toJSON();
});

bookingRouter.post("/bookings/:uuid/extend", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  await extendBookingBodySchema.validate(ctx.request.body);
  const reqBody = extendBookingBodySchema.cast(ctx.request.body);

  const data = {
    ...reqBody,
    uuid: ctx.params.uuid,
  };

  await extendBookingSchema.validate(data);
  const schema = extendBookingSchema.cast(data) as ExtendBookingSchema;
  const booking = await bookingController.extendBooking(schema, capabilities);
  ctx.body = booking;
  ctx.toJSON();
});

bookingRouter.post("/bookings/:uuid/cancel", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  await cancelBookingBodySchema.validate(ctx.request.body);
  const reqBody = cancelBookingBodySchema.cast(ctx.request.body);

  const data = {
    ...reqBody,
    uuid: ctx.params.uuid,
  };

  await cancelBookingSchema.validate(data);
  const schema = cancelBookingSchema.cast(data) as CancelBookingSchema;
  const booking = await bookingController.cancelBooking(schema, capabilities);
  ctx.body = booking;
  ctx.toJSON();
});

bookingRouter.delete("/bookings/:uuid", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  await cancelBookingBodySchema.validate(ctx.request.body);
  const reqBody = cancelBookingBodySchema.cast(ctx.request.body);

  const data = {
    ...reqBody,
    uuid: ctx.params.uuid,
  };

  await cancelBookingSchema.validate(data);
  const schema = cancelBookingSchema.cast(data) as CancelBookingSchema;
  const booking = await bookingController.cancelBooking(schema, capabilities);
  ctx.body = booking;
  ctx.toJSON();
});

bookingRouter.get("/bookings/:uuid", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const data: GetBookingSchema = {
    uuid: ctx.params.uuid,
  };

  await getBookingSchema.validate(data);
  const schema = getBookingSchema.cast(data) as GetBookingSchema;
  const booking = await bookingController.getBooking(schema, capabilities);
  ctx.body = booking;
  ctx.toJSON();
});

bookingRouter.get("/bookings", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const data: GetBookingsSchema = {
    resellerReference: ctx.query.resellerReference as string | undefined,
    supplierReference: ctx.query.supplierReference as string | undefined,
    localDate: ctx.query.localDate as string | undefined,
    localDateEnd: ctx.query.localDateEnd as string | undefined,
    localDateStart: ctx.query.localDateStart as string | undefined,
  };

  await getBookingsSchema.validate(data);
  const schema = getBookingsSchema.cast(data) as GetBookingsSchema;
  const bookings = await bookingController.getBookings(schema, capabilities);
  ctx.body = bookings;
  ctx.toJSON();
});
