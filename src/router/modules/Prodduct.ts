import Router from "@koa/router";
import { getCapabilities } from "./../common";
import { ProductController } from "./../../controllers/ProductController";

export const productRouter = new Router();

const productController = new ProductController();

productRouter.get("/products", (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const data = productController.getProducts(capabilities);
  ctx.body = data;
  ctx.toJSON();
});

productRouter.get("/products/:productId", (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const productId = ctx.params.productId;
  const data = productController.getProduct(productId, capabilities);
  ctx.body = data;
  ctx.toJSON();
});
