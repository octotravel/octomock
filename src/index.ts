import { OctoError, InternalServerError } from "./models/Error";
import Koa from "koa";
import koaBody from "koa-body";
import { router } from "./router/AppRouter";
import { parseCapabilities } from "./router/middlewares";
import { DB } from "./storage/Database";
import { DataGenerator } from "./generators/DataGenerator";

const app = new Koa();

DB.getInstance().open();
app.use(koaBody());
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log(err)
    if (err instanceof OctoError) {
      ctx.status = err.status;
      ctx.body = err.body;
    } else {
      const error = new InternalServerError(err.message);
      ctx.status = error.status;
      ctx.body = error.body;
    }
  }
});
app.use(async (ctx, next) => {
  ctx.set('x-request-id', DataGenerator.generateUUID())
  await next()
})
app.use(parseCapabilities);
app.use(router.routes());

app.listen(3000);
