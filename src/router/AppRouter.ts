import Router from "@koa/router";
import { bookingRouter } from "./modules/Booking";
import { availabilityRouter } from "./modules/Availability";
import { productRouter } from "./modules/Prodduct";
import { CapabilityController } from "../controllers/CapabilityController";
import { supplierRouter } from "./modules/Supplier";

export const router = new Router();

const capabilityController = new CapabilityController();

router.use(supplierRouter.routes());
router.use(productRouter.routes());
router.use(availabilityRouter.routes());
router.use(bookingRouter.routes());
router.get("/capabilities", async (ctx, _) => {
  const data = await capabilityController.getCapabilities();
  ctx.body = data;
  ctx.toJSON();
});
