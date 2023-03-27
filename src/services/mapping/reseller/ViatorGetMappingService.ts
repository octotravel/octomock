import { ProductModel, MappingModel } from "@octocloud/generators";
import { ResellerStatus } from "@octocloud/types";
import Prando from "prando";
import { SpecificResellerGetMappingService } from "./SpecificResellerGetMappingService";

export class ViatorGetMappingService implements SpecificResellerGetMappingService {
  public async getMapping(productModels: ProductModel[]): Promise<MappingModel[]> {
    return productModels
      .map((productModel) =>
        productModel.optionModels.map((optionModel) => {
          const resellerReference = productModel.id;
          const random = new Prando(resellerReference);

          return new MappingModel({
            resellerReference: resellerReference,
            resellerStatus: ResellerStatus.ACTIVE,
            title: productModel.internalName,
            url: "",
            webhookUrl: null,
            optionRequired: true,
            unitRequired: false,
            productId: productModel.id,
            optionId: optionModel.id,
            unitId: null,
            connected: random.nextBoolean(),
            expediaTourTime: null,
            gygPriceOverApi: random.nextBoolean(),
          });
        }),
      )
      .flat(2);
  }
}
