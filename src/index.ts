import Koa from "koa";
import koaBody from "koa-body";
import { router } from "./router/AppRouter";
import { parseCapabilities } from "./router/middlewares";
import { DB } from "./storage/Database";

const app = new Koa();

DB.getInstance().open();
app.use(koaBody());
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      error: "BAD_REQUEST",
      errorMessage: err.message,
      stack: err.stack,
    };
  }
});
app.use(parseCapabilities);
app.use(router.routes());

app.listen(3000);
