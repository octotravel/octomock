import { CapabilityId } from "./../types/Capability";
import Router from "@koa/router";
import { ProductController } from "../controllers/ProductController";
import { BookingController } from "../controllers/BookingController";
import { CreateBookingSchema } from "../schemas/Booking";
import { AvailabilityController } from "../controllers/AvailabilityController";
import { availabilitySchema, AvailabilitySchema } from "../schemas/Availability";
import { AvailabilityValidator } from "../validators/AvailabilityValidator";

export const router = new Router();
const productController = new ProductController();
const availabilityController = new AvailabilityController();
const bookingController = new BookingController();
const availabilityValidator = new AvailabilityValidator()

const getCapabilities = (ctx: any): CapabilityId[] => {
  return ctx.capabilities as CapabilityId[];
};

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

router.get("/availability", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const data: AvailabilitySchema = {
    productId: '1',
    optionId: 'DEFAULT',
    localDateStart: '2021-10-20',
    localDateEnd: '2021-10-30'
  }

  await availabilitySchema.validate(data)
  const schema = availabilitySchema.cast(data) as AvailabilitySchema;
  availabilityValidator.validate({
    availabilityIds: schema.availabilityIds,
    localDate: schema.localDate,
    localDateEnd: schema.localDateEnd,
    localDateStart: schema.localDateStart
  })

  const body = await availabilityController.getAvailability(schema, capabilities);
  
  ctx.body = body;
  ctx.toJSON();
});

router.post("/bookings", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const data = await bookingController.createBooking(
    {} as CreateBookingSchema,
    capabilities
  );
  ctx.body = data;
  ctx.toJSON();
});

