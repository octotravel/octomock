import { ProductModel, MappingModel } from "@octocloud/generators";
import { ResellerStatus } from "@octocloud/types";
import Prando from "prando";
import { SpecificResellerGetMappingService } from "./SpecificResellerGetMappingService";

export class GetYourGuideGetMappingService implements SpecificResellerGetMappingService {
  public async getMapping(productModels: ProductModel[]): Promise<MappingModel[]> {
    return productModels
      .map((productModel) =>
        productModel.optionModels.map((optionModel) =>
          optionModel.unitModels.map((unitModel) => {
            const resellerReference = [productModel.id, optionModel.id].join("-");
            const random = new Prando(resellerReference);

            return new MappingModel({
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
              connected: random.nextBoolean(),
              expediaTourTime: null,
              gygPriceOverApi: random.nextBoolean(),
            });
          }),
        ),
      )
      .flat(2);
  }
}
