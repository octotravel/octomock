import { CapabilityId } from "./../types/Capability";
import Router from "@koa/router";
import { ProductController } from "../controllers/ProductController";

export const router = new Router();
const productController = new ProductController();

const getCapabilities = (ctx: any): CapabilityId[] => {
  return ctx.capabilities as CapabilityId[];
};

router.get("/products", (ctx, _) => {
  const capabilities = getCapabilities(ctx);

  const products = productController.getProducts(capabilities);
  ctx.body = products;
  ctx.toJSON();
});

router.get("/products/:productId", (ctx, _) => {
  const capabilities = getCapabilities(ctx);
  const productId = ctx.params.productId;
  const product = productController.getProduct(productId, capabilities);
  ctx.body = product;
  ctx.toJSON();
});
