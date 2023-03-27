import { MappingModel, ProductModel } from "@octocloud/generators";

export interface SpecificResellerGetMappingService {
  getMapping(productModels: ProductModel[]): Promise<MappingModel[]>;
}
