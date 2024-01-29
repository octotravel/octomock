import { ProductModel, MappingModel } from '@octocloud/generators';
import { ResellerStatus } from '@octocloud/types';
import Prando from 'prando';
import { Reseller } from '../../../types/Reseller';
import { SpecificResellerGetMappingService } from './SpecificResellerGetMappingService';
import { DataGenerator } from '../../../generators/DataGenerator';

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

export class ExpediaGetMappingService implements SpecificResellerGetMappingService<ExpediaMappingModel> {
  private readonly connectedProductUuids = [
    '9cbd7f33-6b53-45c4-a44b-730605f68753',
    'b5c0ab15-6575-4ca4-a39d-a8c7995ccbda',
    'bb9eb918-fcb5-4947-9fce-86586bbea111',
    '0a8f2ef2-7469-4ef0-99fa-a67132ab0bce',
  ];

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
            ].join('_');

            const title = `${productModel.internalName} | ${availabilityLocalStartTime}, ${optionModel.internalName} | ${unitModel.internalName}`;

            const mappingModel = new ExpediaMappingModel({
              id: DataGenerator.generateUUID(),
              resellerReference,
              resellerStatus: ResellerStatus.ACTIVE,
              title,
              url: '',
              webhookUrl: null,
              optionRequired: true,
              unitRequired: true,
              productId: productModel.id,
              optionId: optionModel.id,
              unitId: unitModel.id,
              connected: this.connectedProductUuids.includes(productModel.id),
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
