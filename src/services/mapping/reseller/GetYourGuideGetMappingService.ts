import { ProductModel, MappingModel } from '@octocloud/generators';
import { ResellerStatus } from '@octocloud/types';
import Prando from 'prando';
import { SpecificResellerGetMappingService } from './SpecificResellerGetMappingService';
import { DataGenerator } from '../../../generators/DataGenerator';

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

export class GetYourGuideGetMappingService implements SpecificResellerGetMappingService<GetYourGuideMappingModel> {
  private readonly connectedProductUuids = [
    '9cbd7f33-6b53-45c4-a44b-730605f68753',
    'b5c0ab15-6575-4ca4-a39d-a8c7995ccbda',
    'bb9eb918-fcb5-4947-9fce-86586bbea111',
    '0a8f2ef2-7469-4ef0-99fa-a67132ab0bce',
  ];

  public async getMapping(productModels: ProductModel[]): Promise<GetYourGuideMappingModel[]> {
    return productModels
      .map((productModel) =>
        productModel.optionModels.map((optionModel) =>
          optionModel.unitModels.map((unitModel) => {
            const resellerReference = [productModel.id, optionModel.id].join('-');
            const random = new Prando(resellerReference);

            return new GetYourGuideMappingModel({
              id: DataGenerator.generateUUID(),
              resellerReference,
              resellerStatus: ResellerStatus.ACTIVE,
              title: productModel.internalName,
              url: '',
              webhookUrl: null,
              optionRequired: true,
              unitRequired: true,
              productId: productModel.id,
              optionId: optionModel.id,
              unitId: unitModel.id,
              connected: this.connectedProductUuids.includes(productModel.id),
              gygPriceOverApi: random.nextBoolean(),
            });
          }),
        ),
      )
      .flat(2);
  }
}
