import Koa from "koa";
import { router } from "./router/AppRouter";
import { parseCapabilities } from "./router/middlewares";

const app = new Koa();

app.use(parseCapabilities);
app.use(router.routes());

app.listen(3000);
