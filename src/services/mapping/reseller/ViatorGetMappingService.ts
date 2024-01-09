import { ProductModel, MappingModel } from "@octocloud/generators";
import { ResellerStatus } from "@octocloud/types";
import Prando from "prando";
import { SpecificResellerGetMappingService } from "./SpecificResellerGetMappingService";
import { DataGenerator } from "../../../generators/DataGenerator";

export class ViatorMappingModel extends MappingModel {
  public readonly viatorRecurringPriceSync: boolean;

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
    viatorRecurringPriceSync: boolean;
  }) {
    super(props);
    this.viatorRecurringPriceSync = props.viatorRecurringPriceSync;
  }
}

export class ViatorGetMappingService
  implements SpecificResellerGetMappingService<ViatorMappingModel>
{
  public async getMapping(productModels: ProductModel[]): Promise<ViatorMappingModel[]> {
    return productModels
      .map((productModel) =>
        productModel.optionModels.map((optionModel) => {
          const resellerReference = productModel.id;
          const random = new Prando(resellerReference);

          return new ViatorMappingModel({
            id: DataGenerator.generateUUID(),
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
            viatorRecurringPriceSync: random.nextBoolean(),
          });
        }),
      )
      .flat(2);
  }
}
