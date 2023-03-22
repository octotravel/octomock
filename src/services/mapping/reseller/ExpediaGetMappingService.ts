import { ProductModel, MappingModel } from "@octocloud/generators";
import { ResellerStatus } from "@octocloud/types";
import { Reseller } from "../../../types/Reseller";
import { SpecificResellerGetMappingService } from "./SpecificResellerGetMappingService";

export class ExpediaGetMappingService implements SpecificResellerGetMappingService {
  public async getMapping(productModels: ProductModel[]): Promise<MappingModel[]> {
    const mappingModels: MappingModel[] = [];

    productModels.forEach((productModel) => {
      productModel.optionModels.forEach((optionModel) => {
        optionModel.unitModels.forEach((unitModel) => {
          const resellerReference = [
            Reseller.Expedia,
            productModel.id,
            optionModel.id,
            unitModel.type.toLowerCase(),
          ].join("_");

          const mappingModel = new MappingModel({
            resellerReference: resellerReference,
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
            gygPriceOverApi: Math.random() < 0.5,
          });

          mappingModels.push(mappingModel);
        });
      });
    });

    return mappingModels;
  }
}
