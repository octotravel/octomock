import Router from "@koa/router";
import { MappingController } from "../../controllers/MappingController";

export const mappingRouter = new Router();

const mappingController = new MappingController();

mappingRouter.get("/mappings", async (ctx, _) => {
  const apiKey: string = ctx.get("Authorization").split(" ")[1] ?? "";
  const mappings = await mappingController.getMapping(apiKey);
  ctx.body = mappings;
  ctx.toJSON();
});
