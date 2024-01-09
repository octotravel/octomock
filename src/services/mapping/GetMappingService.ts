import { MappingModel, ProductModel } from "@octocloud/generators";
import { Mapping } from "@octocloud/types";
import { SpecificResellerGetMappingService } from "./reseller/SpecificResellerGetMappingService";
import { ViatorGetMappingService } from "./reseller/ViatorGetMappingService";
import { ExpediaGetMappingService } from "./reseller/ExpediaGetMappingService";
import { GetYourGuideGetMappingService } from "./reseller/GetYourGuideGetMappingService";
import { Reseller } from "../../types/Reseller";

interface IGetMappingService {
  getMapping(reseller: Reseller, productModels: ProductModel[]): Promise<Mapping[]>;
}

export class GetMappingService implements IGetMappingService {
  public async getMapping(reseller: Reseller, productModels: ProductModel[]): Promise<Mapping[]> {
    const resellerMappingService = this.getMappingServiceForReseller(reseller);

    return resellerMappingService.getMapping(productModels);
  }

  private getMappingServiceForReseller(
    reseller: Reseller,
  ): SpecificResellerGetMappingService<MappingModel> {
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
