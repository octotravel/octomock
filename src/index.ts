import 'isomorphic-fetch';
import cors from '@koa/cors';
import dotenv from 'dotenv';
import Koa, { Context } from 'koa';
import koaBody, { HttpMethodEnum } from 'koa-body';
import { ValidationError } from 'yup';
import { DataGenerator } from './generators/DataGenerator';
import { BadRequestError, InternalServerError, OctoError } from './models/Error';
import { router } from './router/AppRouter';
import { parseCapabilities } from './router/middlewares';

dotenv.config();

const app = new Koa();

app.use(cors());
app.use(
  koaBody({
    parsedMethods: [HttpMethodEnum.POST, HttpMethodEnum.PUT, HttpMethodEnum.PATCH, HttpMethodEnum.DELETE],
    onError: (error: Error, context: Context) => {
      throw new BadRequestError(`The request body is not formatted correctly (${error.message}).`);
    },
  }),
);
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: unknown) {
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
      const error = new InternalServerError(err instanceof Error ? err.message : 'Unknown error');
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

const port = process.env.PORT ?? 3002;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Running app on port ${port}`);
});
