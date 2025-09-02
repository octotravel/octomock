import { Mapping } from '@octocloud/types';
import { MappingParser } from '../helpers/MappingParser';
import { ProductRepository } from '../repositories/ProductRepository';
import { ResellerRepository } from '../repositories/ResellerRepository';
import { GetMappingsQueryParamsSchema } from '../schemas/Mapping';
import { GetMappingService } from '../services/mapping/GetMappingService';
import { ExpediaMappingModel } from '../services/mapping/reseller/ExpediaGetMappingService';
import { GetYourGuideMappingModel } from '../services/mapping/reseller/GetYourGuideGetMappingService';
import { ViatorMappingModel } from '../services/mapping/reseller/ViatorGetMappingService';

interface IMappingController {
  getMapping: (apiKey: string, queryParams?: GetMappingsQueryParamsSchema) => Promise<Mapping[]>;
}

export class MappingController implements IMappingController {
  private readonly resellerRepository = new ResellerRepository();

  private readonly productRepository = new ProductRepository();

  private readonly getMappingService = new GetMappingService();

  private readonly mappingParser = new MappingParser();

  public async getMapping(apiKey: string, queryParams?: GetMappingsQueryParamsSchema): Promise<Mapping[]> {
    const reseller = this.resellerRepository.getReseller(apiKey);
    const productModels = this.productRepository.getProducts();
    const mappingModels = await this.getMappingService.getMapping(reseller, productModels, queryParams);

    return mappingModels.map((mappingModel) =>
      this.mappingParser.parseModelToPOJO(
        mappingModel as ExpediaMappingModel | GetYourGuideMappingModel | ViatorMappingModel,
      ),
    );
  }
}
