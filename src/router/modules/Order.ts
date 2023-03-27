import Router from "@koa/router";
import {
  extendOrderBodySchema,
  orderCancellationBodySchema,
  orderConfirmationBodySchema,
} from "@octocloud/types";
import { getCapabilities } from "../common";
import { OrderController } from "../../controllers/OrderController";
import {
  confirmOrderSchema,
  ConfirmOrderSchema,
  extendOrderSchema,
  ExtendOrderSchema,
  cancelOrderSchema,
  CancelOrderSchema,
  getOrderSchema,
  GetOrderSchema,
} from "../../schemas/Order";

export const orderRouter = new Router();

const orderController = new OrderController();

orderRouter.post("/orders/:id/confirm", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  await orderConfirmationBodySchema.validate(ctx.request.body);
  const reqBody = orderConfirmationBodySchema.cast(ctx.request.body);

  const data = {
    ...reqBody,
    id: ctx.params.id,
  };

  await confirmOrderSchema.validate(data);
  const schema = confirmOrderSchema.cast(data) as ConfirmOrderSchema;
  const order = await orderController.confirmOrder(schema, capabilities);
  ctx.body = order;
  ctx.toJSON();
});

orderRouter.post("/orders/:id/extend", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  await extendOrderBodySchema.validate(ctx.request.body);
  const reqBody = extendOrderBodySchema.cast(ctx.request.body);

  const data = {
    ...reqBody,
    id: ctx.params.id,
  };

  await extendOrderSchema.validate(data);
  const schema = extendOrderSchema.cast(data) as ExtendOrderSchema;
  const order = await orderController.extendOrder(schema, capabilities);
  ctx.body = order;
  ctx.toJSON();
});

orderRouter.post("/orders/:id/cancel", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  await orderCancellationBodySchema.validate(ctx.request.body);
  const reqBody = orderCancellationBodySchema.cast(ctx.request.body);

  const data = {
    ...reqBody,
    id: ctx.params.id,
  };

  await cancelOrderSchema.validate(data);
  const schema = cancelOrderSchema.cast(data) as CancelOrderSchema;
  const order = await orderController.cancelOrder(schema, capabilities);
  ctx.body = order;
  ctx.toJSON();
});

orderRouter.delete("/orders/:id", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  await orderCancellationBodySchema.validate(ctx.request.body);
  const reqBody = orderCancellationBodySchema.cast(ctx.request.body);

  const data = {
    ...reqBody,
    id: ctx.params.id,
  };

  await cancelOrderSchema.validate(data);
  const schema = cancelOrderSchema.cast(data) as CancelOrderSchema;
  const order = await orderController.cancelOrder(schema, capabilities);
  ctx.body = order;
  ctx.toJSON();
});

orderRouter.get("/orders/:id", async (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const data: GetOrderSchema = {
    id: ctx.params.id,
  };

  await getOrderSchema.validate(data);
  const schema = getOrderSchema.cast(data) as GetOrderSchema;
  const order = await orderController.getOrder(schema, capabilities);
  ctx.body = order;
  ctx.toJSON();
});
