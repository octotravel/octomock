import { MappingParser } from '@octocloud/generators';
import { Mapping } from '@octocloud/types';
import { GetMappingService } from '../services/mapping/GetMappingService';
import { ResellerRepository } from '../repositories/ResellerRepository';
import { ProductRepository } from '../repositories/ProductRepository';

interface IMappingController {
  getMapping: (apiKey: string) => Promise<Mapping[]>;
}

export class MappingController implements IMappingController {
  private readonly resellerRepository = new ResellerRepository();

  private readonly productRepository = new ProductRepository();

  private readonly getMappingService = new GetMappingService();

  private readonly mappingParser = new MappingParser();

  public async getMapping(apiKey: string): Promise<Mapping[]> {
    const reseller = this.resellerRepository.getReseller(apiKey);
    const productModels = this.productRepository.getProducts();
    const mappingModels = await this.getMappingService.getMapping(reseller, productModels);

    return mappingModels.map((mappingModel) => this.mappingParser.parseModelToPOJO(mappingModel));
  }
}
