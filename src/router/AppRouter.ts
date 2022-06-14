import {
  CapabilityId,
  AvailabilityCalendarBodySchema,
  availabilityCalendarBodySchema,
  availabilityBodySchema,
  AvailabilityBodySchema,
} from "@octocloud/types";
import { AvailabilityCalendarController } from "./../controllers/AvailabilityCalendarController";
import { CapabilityController } from "./../controllers/CapabilityController";
import { SupplierController } from "./../controllers/SupplierController";
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
} from "./../schemas/Booking";
import Router from "@koa/router";
import { ProductController } from "../controllers/ProductController";
import { BookingController } from "../controllers/BookingController";
import { AvailabilityController } from "../controllers/AvailabilityController";
import {
  OctoMethod,
  OctoValidationService,
  ValidationData,
} from "../services/validation/OldOctoValidationService";
import { validationSchema } from "../schemas/Validation";
import { OctoFlowValidationService } from "../services/validation/OctoFlowValidation";

export const router = new Router();
const productController = new ProductController();
const availabilityController = new AvailabilityController();
const availabilityCalendarController = new AvailabilityCalendarController();
const bookingController = new BookingController();
const supplierController = new SupplierController();
const capabilityController = new CapabilityController();
const validationService = new OctoValidationService();
const flowValidator = new OctoFlowValidationService();

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

router.post("/availability/calendar", async (ctx, _) => {
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

router.post("/bookings", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  const data: CreateBookingSchema = ctx.request.body;

  await createBookingSchema.validate(data);
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

router.patch("/bookings/:uuid", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  ctx.body = {
    ...ctx.request.body,
    uuid: ctx.params.uuid,
  };
  await updateBookingSchema.validate(ctx.body);
  const schema = updateBookingSchema.cast(ctx.body);

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
    resellerReference: ctx.query.resellerReference as string | undefined,
    supplierReference: ctx.query.supplierReference as string | undefined,
    localDate: ctx.query.localDate as string | undefined,
    localDateEnd: ctx.query.localDateEnd as string | undefined,
    localDateStart: ctx.query.localDateStart as string | undefined,
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

router.get("/validate", async (ctx, _) => {
  //const capabilities = getCapabilities(ctx);

  const data: ValidationData = {
    url: ctx.query.url as string,
    method: ctx.query.method as OctoMethod,
  };
  await validationSchema.validate(data);
  const params = validationSchema.cast(data);

  const validation = await validationService.validate(params);

  ctx.body = validation;
  ctx.toJSON();
});

router.get("/validateflow", async (ctx, _) => {
  const validation = flowValidator.validateFlow();

  ctx.body = validation;
  ctx.toJSON();
});
