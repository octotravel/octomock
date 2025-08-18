import Router from '@koa/router';
import { WhoAmIController } from 'controllers/WhoAmIController';
import { CapabilityController } from '../controllers/CapabilityController';
import { availabilityRouter } from './modules/Availability';
import { bookingRouter } from './modules/Booking';
import { mappingRouter } from './modules/Mapping';
import { orderRouter } from './modules/Order';
import { productRouter } from './modules/Product';
import { supplierRouter } from './modules/Supplier';

export const router = new Router();

const capabilityController = new CapabilityController();
const whoAmIController = new WhoAmIController();

router.use(supplierRouter.routes());
router.use(productRouter.routes());
router.use(availabilityRouter.routes());
router.use(bookingRouter.routes());
router.use(mappingRouter.routes());
router.use(orderRouter.routes());
router.get('/capabilities', async (ctx, _) => {
  const data = await capabilityController.getCapabilities();
  ctx.body = data;
  ctx.toJSON();
});
router.get('/whoami', async (ctx) => await whoAmIController.get(ctx));
