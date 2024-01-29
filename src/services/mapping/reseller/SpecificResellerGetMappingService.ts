import { MappingModel, ProductModel } from '@octocloud/generators';

export interface SpecificResellerGetMappingService<SpecificResellerMappingModel extends MappingModel> {
  getMapping: (productModels: ProductModel[]) => Promise<SpecificResellerMappingModel[]>;
}
