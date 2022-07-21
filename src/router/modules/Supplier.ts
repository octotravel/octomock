import { SupplierController } from "./../../controllers/SupplierController";
import Router from "@koa/router";

export const supplierRouter = new Router();

const supplierController = new SupplierController();

supplierRouter.get("/suppliers", async (ctx, _) => {
  const suppliers = await supplierController.getSuppliers();
  ctx.body = suppliers;
  ctx.toJSON();
});

supplierRouter.get("/suppliers/:id", async (ctx, _) => {
  const supplier = await supplierController.getSupplier(ctx.params.id);
  ctx.body = supplier;
  ctx.toJSON();
});
