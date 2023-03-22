import { ProductModel, MappingModel } from "@octocloud/generators";
import { ResellerStatus } from "@octocloud/types";
import { SpecificResellerGetMappingService } from "./SpecificResellerGetMappingService";

export class GetYourGuideGetMappingService implements SpecificResellerGetMappingService {
  public async getMapping(productModels: ProductModel[]): Promise<MappingModel[]> {
    const mappingModels: MappingModel[] = [];

    productModels.forEach((productModel) => {
      productModel.optionModels.forEach((optionModel) => {
        optionModel.unitModels.forEach((unitModel) => {
          const mappingModel = new MappingModel({
            resellerReference: `${productModel.id}-${optionModel.id}`,
            resellerStatus: ResellerStatus.ACTIVE,
            title: productModel.internalName,
            url: "",
            webhookUrl: null,
            optionRequired: true,
            unitRequired: true,
            productId: productModel.id,
            optionId: optionModel.id,
            unitId: unitModel.id,
            connected: Math.random() < 0.5,
            expediaTourTime: null,
            gygPriceOverApi: false,
          });

          mappingModels.push(mappingModel);
        });
      });
    });

    return mappingModels;
  }
}
