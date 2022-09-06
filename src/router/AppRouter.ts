import { bookingRouter } from "./modules/Booking";
import { availabilityRouter } from "./modules/Availability";
import { productRouter } from "./modules/Prodduct";
import { CapabilityController } from "./../controllers/CapabilityController";
import Router from "@koa/router";
import { ConfigParser } from "../services/validation/config/ConfigParser";
import { ValidationController } from "../services/validation/Controller";
import { validationConfigSchema } from "../schemas/Validation";
import { supplierRouter } from "./modules/Supplier";

export const router = new Router();

const capabilityController = new CapabilityController();

router.use(supplierRouter.routes());
router.use(productRouter.routes());
router.use(availabilityRouter.routes());
router.use(bookingRouter.routes());
router.get("/capabilities", async (ctx, _) => {
  const supplier = await capabilityController.getCapabilities();
  ctx.body = supplier;
  ctx.toJSON();
});

router.post("/validate", async (ctx, _) => {
  // create some init class
  await validationConfigSchema.validate(ctx.request.body);
  const schema = validationConfigSchema.cast(ctx.request.body);
  const preConfig = await new ConfigParser().parse(schema);

  const body = await new ValidationController({ preConfig }).validate();

  ctx.status = 200;
  ctx.body = body;
  ctx.toJSON();
});
