import { ProductModel, MappingModel } from "@octocloud/generators";
import { ResellerStatus } from "@octocloud/types";
import Prando from "prando";
import { Reseller } from "../../../types/Reseller";
import { SpecificResellerGetMappingService } from "./SpecificResellerGetMappingService";

export class ExpediaGetMappingService implements SpecificResellerGetMappingService {
  public async getMapping(productModels: ProductModel[]): Promise<MappingModel[]> {
    return productModels
      .map((productModel) =>
        productModel.optionModels.map((optionModel) =>
          optionModel.unitModels.map((unitModel) => {
            const resellerReference = [
              Reseller.Expedia,
              productModel.id,
              optionModel.id,
              unitModel.type.toLowerCase(),
            ].join("_");
            const tourTime = "10:15";
            const title = `${productModel.internalName} | ${tourTime}, ${optionModel.internalName} | ${unitModel.internalName}`;
            const random = new Prando(resellerReference);

            return new MappingModel({
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
              expediaTourTime: tourTime,
              gygPriceOverApi: random.nextBoolean(),
            });
          }),
        ),
      )
      .flat(2);
  }
}
