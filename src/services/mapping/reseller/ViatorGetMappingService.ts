import { ProductModel, MappingModel } from "@octocloud/generators";
import { ResellerStatus } from "@octocloud/types";
import { SpecificResellerGetMappingService } from "./SpecificResellerGetMappingService";

export class ViatorGetMappingService implements SpecificResellerGetMappingService {
  public async getMapping(productModels: ProductModel[]): Promise<MappingModel[]> {
    const mappingModels: MappingModel[] = [];

    productModels.forEach((productModel) => {
      productModel.optionModels.forEach((optionModel) => {
        const mappingModel = new MappingModel({
          resellerReference: productModel.id,
          resellerStatus: ResellerStatus.ACTIVE,
          title: productModel.internalName,
          url: "",
          webhookUrl: "",
          optionRequired: true,
          unitRequired: false,
          productId: productModel.id,
          optionId: optionModel.id,
          unitId: null,
          connected: true,
          expediaTourTime: null,
          gygPriceOverApi: false,
        });

        mappingModels.push(mappingModel);
      });
    });

    return mappingModels;
  }
}
