import { ProductModel, MappingModel } from "@octocloud/generators";
import { ResellerStatus } from "@octocloud/types";
import Prando from "prando";
import { SpecificResellerGetMappingService } from "./SpecificResellerGetMappingService";

export class ViatorGetMappingService implements SpecificResellerGetMappingService {
  private readonly connectedProductUuids = [
    "9cbd7f33-6b53-45c4-a44b-730605f68753",
    "b5c0ab15-6575-4ca4-a39d-a8c7995ccbda",
    "bb9eb918-fcb5-4947-9fce-86586bbea111",
    "0a8f2ef2-7469-4ef0-99fa-a67132ab0bce",
  ];

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
            connected: this.connectedProductUuids.includes(productModel.id),
            expediaTourTime: null,
            gygPriceOverApi: random.nextBoolean(),
          });
        }),
      )
      .flat(2);
  }
}
