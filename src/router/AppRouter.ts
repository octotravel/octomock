import { bookingRouter } from "./modules/Booking";
import { availabilityRouter } from "./modules/Availability";
import { productRouter } from "./modules/Prodduct";
import { CapabilityController } from "./../controllers/CapabilityController";
import Router from "@koa/router";
import { ValidationController } from "../services/validation/Controller";
import { validationConfigSchema } from "../schemas/Validation";
import { supplierRouter } from "./modules/Supplier";
import { Config } from "../services/validation/config/Config";

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

  const config = Config.getInstance();
  config.init(schema);

  const body = await new ValidationController().validate();

  ctx.status = 200;
  ctx.body = body;
  ctx.toJSON();
});
