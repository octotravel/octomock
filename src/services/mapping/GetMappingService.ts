import { MappingModel, ProductModel } from '@octocloud/generators';
import { filterMappings } from 'services/mapping/MappingFilter';
import { GetMappingsQueryParamsSchema } from '../../schemas/Mapping';
import { Reseller } from '../../types/Reseller';
import { ExpediaGetMappingService } from './reseller/ExpediaGetMappingService';
import { GetYourGuideGetMappingService } from './reseller/GetYourGuideGetMappingService';
import { SpecificResellerGetMappingService } from './reseller/SpecificResellerGetMappingService';
import { ViatorGetMappingService } from './reseller/ViatorGetMappingService';

interface IGetMappingService {
  getMapping: (
    reseller: Reseller,
    productModels: ProductModel[],
    queryParams?: GetMappingsQueryParamsSchema,
  ) => Promise<MappingModel[]>;
}

export class GetMappingService implements IGetMappingService {
  public async getMapping(
    reseller: Reseller,
    productModels: ProductModel[],
    queryParams?: GetMappingsQueryParamsSchema,
  ): Promise<MappingModel[]> {
    const resellerMappingService = this.getMappingServiceForReseller(reseller);
    const mappingModels = await resellerMappingService.getMapping(productModels);

    return filterMappings(mappingModels, queryParams);
  }

  private getMappingServiceForReseller(reseller: Reseller): SpecificResellerGetMappingService<MappingModel> {
    switch (reseller) {
      case Reseller.Viator:
        return new ViatorGetMappingService();
      case Reseller.Expedia:
        return new ExpediaGetMappingService();
      case Reseller.GetYourGuide:
        return new GetYourGuideGetMappingService();
      default:
        throw new Error(`Invalid reseller: ${reseller}.`);
    }
  }
}
