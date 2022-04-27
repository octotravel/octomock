import { CapabilityId } from '@octocloud/types';
import { AvailabilityCalendarController } from './../controllers/AvailabilityCalendarController';
import { CapabilityController } from "./../controllers/CapabilityController";
import { SupplierController } from "./../controllers/SupplierController";
import {
  cancelBookingSchema,
  confirmBookingSchema,
  extendBookingSchema,
  getBookingSchema,
  GetBookingSchema,
  GetBookingsSchema,
  getBookingsSchema,
  patchBookingSchema,
} from "./../schemas/Booking";
import Router from "@koa/router";
import { ProductController } from "../controllers/ProductController";
import { BookingController } from "../controllers/BookingController";
import { CreateBookingSchema } from "../schemas/Booking";
import { AvailabilityController } from "../controllers/AvailabilityController";
import {
  availabilitySchema,
  AvailabilitySchema,
} from "../schemas/Availability";
import { AvailabilityValidator } from "../validators/AvailabilityValidator";
import { availabilityCalendarSchema, AvailabilityCalendarSchema } from "../schemas/AvailabilityCalendar";

export const router = new Router();
const productController = new ProductController();
const availabilityController = new AvailabilityController();
const availabilityCalendarController = new AvailabilityCalendarController();
const bookingController = new BookingController();
const supplierController = new SupplierController();
const capabilityController = new CapabilityController();
const availabilityValidator = new AvailabilityValidator();

const getCapabilities = (ctx: any): CapabilityId[] => {
  return ctx.capabilities as CapabilityId[];
};

// TODO: make router "modular"

router.get("/products", (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const data = productController.getProducts(capabilities);
  ctx.body = data;
  ctx.toJSON();
});

router.get("/products/:productId", (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const productId = ctx.params.productId;
  const data = productController.getProduct(productId, capabilities);
  ctx.body = data;
  ctx.toJSON();
});

router.post("/availability", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  const data: AvailabilitySchema = ctx.request.body;

  await availabilitySchema.validate(data);
  const schema = availabilitySchema.cast(data) as AvailabilitySchema;
  availabilityValidator.validate({
    availabilityIds: schema.availabilityIds,
    localDate: schema.localDate,
    localDateEnd: schema.localDateEnd,
    localDateStart: schema.localDateStart,
  });

  const body = await availabilityController.getAvailability(
    schema,
    capabilities
  );

  ctx.body = body;
  ctx.toJSON();
});

router.post("/availability/calendar", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  const data: AvailabilityCalendarSchema = ctx.request.body;

  await availabilityCalendarSchema.validate(data);
  const schema = availabilitySchema.cast(data) as AvailabilityCalendarSchema;

  const body = await availabilityCalendarController.getAvailability(
    schema,
    capabilities
  );

  ctx.body = body;
  ctx.toJSON();
});

router.post("/bookings", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  const data: CreateBookingSchema = ctx.request.body;

  await availabilitySchema.validate(data);
  const booking = await bookingController.createBooking(
    {
      ...data,
    } as CreateBookingSchema,
    capabilities
  );
  ctx.body = booking;
  ctx.toJSON();
});

router.post("/bookings/:uuid/confirm", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  ctx.body = {
    ...ctx.request.body,
    uuid: ctx.params.uuid,
  };
  await confirmBookingSchema.validate(ctx.body);
  const schema = confirmBookingSchema.cast(ctx.body);

  const booking = await bookingController.confirmBooking(schema, capabilities);
  ctx.body = booking;
  ctx.toJSON();
});

router.patch("/bookings/:uuid/update", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  ctx.body = {
    ...ctx.request.body,
    uuid: ctx.params.uuid,
  };
  await patchBookingSchema.validate(ctx.body);
  const schema = patchBookingSchema.cast(ctx.body);

  const booking = await bookingController.updateBooking(schema, capabilities);
  ctx.body = booking;
  ctx.toJSON();
});

router.post("/bookings/:uuid/extend", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  ctx.body = {
    ...ctx.request.body,
    uuid: ctx.params.uuid,
  };
  await extendBookingSchema.validate(ctx.body);
  const schema = extendBookingSchema.cast(ctx.body);

  const booking = await bookingController.extendBooking(schema, capabilities);
  ctx.body = booking;
  ctx.toJSON();
});

router.post("/bookings/:uuid/cancel", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  ctx.body = {
    ...ctx.request.body,
    uuid: ctx.params.uuid,
  };
  await cancelBookingSchema.validate(ctx.body);
  const schema = cancelBookingSchema.cast(ctx.body);

  const booking = await bookingController.cancelBooking(schema, capabilities);
  ctx.body = booking;
  ctx.toJSON();
});

router.delete("/bookings/:uuid", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  ctx.body = {
    ...ctx.request.body,
    uuid: ctx.params.uuid,
  };
  await cancelBookingSchema.validate(ctx.body);
  const schema = cancelBookingSchema.cast(ctx.body);

  const booking = await bookingController.cancelBooking(schema, capabilities);
  ctx.body = booking;
  ctx.toJSON();
});

router.get("/bookings/:uuid", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const data: GetBookingSchema = {
    uuid: ctx.params.uuid,
  };

  await getBookingSchema.validate(data);
  const schema = getBookingSchema.cast(data);
  const booking = await bookingController.getBooking(schema, capabilities);
  ctx.body = booking;
  ctx.toJSON();
});

router.get("/bookings", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const data: GetBookingsSchema = {
    resellerReference: ctx.query.resellerReference as string,
    supplierReference: ctx.query.supplierReference as string,
  };

  await getBookingsSchema.validate(data);
  const schema = getBookingsSchema.cast(data);
  const bookings = await bookingController.getBookings(schema, capabilities);
  ctx.body = bookings;
  ctx.toJSON();
});

router.get("/suppliers", async (ctx, _) => {
  const suppliers = await supplierController.getSuppliers();
  ctx.body = suppliers;
  ctx.toJSON();
});

router.get("/suppliers/:id", async (ctx, _) => {
  const supplier = await supplierController.getSupplier(ctx.params.id);
  ctx.body = supplier;
  ctx.toJSON();
});

router.get("/capabilities", async (ctx, _) => {
  const supplier = await capabilityController.getCapabilities();
  ctx.body = supplier;
  ctx.toJSON();
});
