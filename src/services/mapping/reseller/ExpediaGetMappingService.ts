import { ProductModel, MappingModel } from "@octocloud/generators";
import { ResellerStatus } from "@octocloud/types";
import Prando from "prando";
import { Reseller } from "../../../types/Reseller";
import { SpecificResellerGetMappingService } from "./SpecificResellerGetMappingService";

export class ExpediaGetMappingService implements SpecificResellerGetMappingService {
  public async getMapping(productModels: ProductModel[]): Promise<MappingModel[]> {
    const mappingModels: MappingModel[] = [];

    productModels.forEach((productModel) => {
      productModel.optionModels.forEach((optionModel) => {
        optionModel.unitModels.forEach((unitModel) => {
          optionModel.availabilityLocalStartTimes.forEach((availabilityLocalStartTime) => {
            const resellerReference = [
              Reseller.Expedia,
              productModel.id,
              optionModel.id,
              unitModel.type.toLowerCase(),
            ].join("_");

            const title = `${productModel.internalName} | ${availabilityLocalStartTime}, ${optionModel.internalName} | ${unitModel.internalName}`;
            const random = new Prando(resellerReference);

            const mappingModel = new MappingModel({
              resellerReference: resellerReference,
              resellerStatus: ResellerStatus.ACTIVE,
              title: title,
              url: "",
              webhookUrl: null,
              optionRequired: true,
              unitRequired: true,
              productId: productModel.id,
              optionId: optionModel.id,
              unitId: unitModel.id,
              connected: random.nextBoolean(),
              expediaTourTime: availabilityLocalStartTime,
              gygPriceOverApi: random.nextBoolean(),
            });

            mappingModels.push(mappingModel);
          });
        });
      });
    });

    return mappingModels;
  }
}
