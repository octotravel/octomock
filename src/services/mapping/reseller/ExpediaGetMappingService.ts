import { ProductModel, MappingModel } from "@octocloud/generators";
import { ResellerStatus } from "@octocloud/types";
import Prando from "prando";
import { Reseller } from "../../../types/Reseller";
import { SpecificResellerGetMappingService } from "./SpecificResellerGetMappingService";

export class ExpediaGetMappingService implements SpecificResellerGetMappingService {
  private readonly connectedProductUuids = [
    "9cbd7f33-6b53-45c4-a44b-730605f68753",
    "b5c0ab15-6575-4ca4-a39d-a8c7995ccbda",
    "bb9eb918-fcb5-4947-9fce-86586bbea111",
    "0a8f2ef2-7469-4ef0-99fa-a67132ab0bce",
  ];

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
              connected: this.connectedProductUuids.includes(productModel.id),
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
