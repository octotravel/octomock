import { ProductModel, MappingModel } from "@octocloud/generators";
import { ResellerStatus } from "@octocloud/types";
import Prando from "prando";
import { SpecificResellerGetMappingService } from "./SpecificResellerGetMappingService";
import { DataGenerator } from "../../../generators/DataGenerator";

export class GetYourGuideMappingModel extends MappingModel {
  public readonly gygPriceOverApi: boolean;

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
    gygPriceOverApi: boolean;
  }) {
    super(props);
    this.gygPriceOverApi = props.gygPriceOverApi;
  }
}

export class GetYourGuideGetMappingService
  implements SpecificResellerGetMappingService<GetYourGuideMappingModel>
{
  public async getMapping(productModels: ProductModel[]): Promise<GetYourGuideMappingModel[]> {
    return productModels
      .map((productModel) =>
        productModel.optionModels.map((optionModel) =>
          optionModel.unitModels.map((unitModel) => {
            const resellerReference = [productModel.id, optionModel.id].join("-");
            const random = new Prando(resellerReference);

            return new GetYourGuideMappingModel({
              id: DataGenerator.generateUUID(),
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
              gygPriceOverApi: random.nextBoolean(),
            });
          }),
        ),
      )
      .flat(2);
  }
}
