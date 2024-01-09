import { ProductModel, MappingModel } from "@octocloud/generators";
import { ResellerStatus } from "@octocloud/types";
import Prando from "prando";
import { Reseller } from "../../../types/Reseller";
import { SpecificResellerGetMappingService } from "./SpecificResellerGetMappingService";
import { DataGenerator } from "../../../generators/DataGenerator";

export class ExpediaMappingModel extends MappingModel {
  public readonly expediaTourTime: string;

  public constructor(props: {
    id: string;
    resellerReference: string;
    resellerStatus: ResellerStatus;
    title: string;
    url: string;
    webhookUrl: Nullable<string>;
    optionRequired: boolean;
    unitRequired: boolean;
    productId: Nullable<string>;
    optionId: Nullable<string>;
    unitId: Nullable<string>;
    connected: boolean;
    expediaTourTime: string;
  }) {
    super(props);
    this.expediaTourTime = props.expediaTourTime;
  }
}

export class ExpediaGetMappingService
  implements SpecificResellerGetMappingService<ExpediaMappingModel>
{
  public async getMapping(productModels: ProductModel[]): Promise<ExpediaMappingModel[]> {
    const mappingModels: ExpediaMappingModel[] = [];

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

            const mappingModel = new ExpediaMappingModel({
              id: DataGenerator.generateUUID(),
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
            });

            mappingModels.push(mappingModel);
          });
        });
      });
    });

    return mappingModels;
  }
}
