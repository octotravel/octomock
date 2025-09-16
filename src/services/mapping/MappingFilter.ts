import { MappingModel } from '@octocloud/generators';
import { GetMappingsQueryParamsSchema } from '../../schemas/Mapping';

export function filterMappings<T extends MappingModel>(mappings: T[], queryParams?: GetMappingsQueryParamsSchema): T[] {
  if (!queryParams) {
    return mappings;
  }

  return mappings.filter((mapping) => {
    if (queryParams.productId && mapping.productId !== queryParams.productId) {
      return false;
    }
    if (queryParams.optionId && mapping.optionId !== queryParams.optionId) {
      return false;
    }
    if (queryParams.resellerReference && mapping.resellerReference !== queryParams.resellerReference) {
      return false;
    }
    return true;
  });
}
