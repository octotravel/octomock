import 'isomorphic-fetch';
import Koa from 'koa';
import koaBody from 'koa-body';
import cors from '@koa/cors';
import { ValidationError } from 'yup';
import dotenv from 'dotenv';
import { router } from './router/AppRouter';
import { parseCapabilities } from './router/middlewares';
import { DB } from './storage/Database';
import { DataGenerator } from './generators/DataGenerator';
import { OctoError, InternalServerError, BadRequestError } from './models/Error';

dotenv.config();

const app = new Koa();

DB.getInstance().open();
app.use(cors());
app.use(koaBody({ parsedMethods: ['POST', 'PUT', 'PATCH', 'GET', 'HEAD', 'DELETE'] }));
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.log(err);
    if (err instanceof OctoError) {
      ctx.status = err.status;
      ctx.body = err.body;
    } else if (err instanceof ValidationError) {
      const error = new BadRequestError(err.message);
      ctx.status = error.status;
      ctx.body = error.body;
    } else {
      const error = new InternalServerError(err.message);
      ctx.status = error.status;
      ctx.body = {
        ...error.body,
        stack: error.stack,
      };
    }
  }
});
app.use(async (ctx, next) => {
  ctx.set('x-request-id', DataGenerator.generateUUID());
  await next();
});
app.use(parseCapabilities);
app.use(router.routes());

app.listen(process.env.PORT ?? 3002, () => {
  // eslint-disable-next-line no-console
  console.log(`Running app on port ${process.env.APP_PORT}`);
});
