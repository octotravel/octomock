import Router from '@koa/router';
import { MappingController } from '../../controllers/MappingController';
import { getMappingsQueryParamsSchema } from '../../schemas/Mapping';

export const mappingRouter = new Router();

const mappingController = new MappingController();

mappingRouter.get('/mappings', async (ctx, _) => {
  const apiKey: string = ctx.get('Authorization').split(' ')[1] ?? '';

  const queryParams = await getMappingsQueryParamsSchema.validate(ctx.query);

  const mappings = await mappingController.getMapping(apiKey, queryParams);
  ctx.body = mappings;
  ctx.toJSON();
});
