import Router from "@koa/router";
import { SupplierController } from "../../controllers/SupplierController";

export const supplierRouter = new Router();

const supplierController = new SupplierController();

supplierRouter.get("/suppliers", async (ctx, _) => {
  const suppliers = await supplierController.getSuppliers();
  ctx.body = suppliers;
  ctx.toJSON();
});

supplierRouter.get("/suppliers/:supplierId", async (ctx, _) => {
  const data = await supplierController.getSupplier();
  ctx.body = data;
  ctx.toJSON();
});

supplierRouter.get("/supplier", async (ctx, _) => {
  const data = await supplierController.getSupplier();
  ctx.body = data;
  ctx.toJSON();
});
