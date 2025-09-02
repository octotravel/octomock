import { MappingModel, ProductModel } from '@octocloud/generators';
import { AvailabilityType, ResellerStatus, Restrictions } from '@octocloud/types';
import { OptionRestrictions } from '@octocloud/types/src/types/Option';
import Prando from 'prando';
import { DataGenerator } from '../../../generators/DataGenerator';
import { SpecificResellerGetMappingService } from './SpecificResellerGetMappingService';

export class ViatorMappingModel extends MappingModel {
  public readonly viatorRecurringPriceSync: boolean;
  public readonly unitType: Nullable<string>;
  public readonly availabilityType: AvailabilityType;
  public readonly timeZone: string;
  public readonly restrictions: OptionRestrictions;
  public readonly unitRestrictions: Restrictions;
  public readonly optionInternalName: string;
  public readonly instantConfirmation: boolean;
  public readonly availabilityLocalStartTimes: string[];

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
    unitType: Nullable<string>;
    connected: boolean;
    viatorRecurringPriceSync: boolean;
    availabilityType: AvailabilityType;
    timeZone: string;
    restrictions: OptionRestrictions;
    unitRestrictions: Restrictions;
    optionInternalName: string;
    instantConfirmation: boolean;
    availabilityLocalStartTimes: string[];
  }) {
    super(props);
    this.viatorRecurringPriceSync = props.viatorRecurringPriceSync;
    this.unitType = props.unitType;
    this.restrictions = props.restrictions;
    this.unitRestrictions = props.unitRestrictions;
    this.availabilityType = props.availabilityType;
    this.timeZone = props.timeZone;
    this.restrictions = props.restrictions;
    this.unitRestrictions = props.unitRestrictions;
    this.optionInternalName = props.optionInternalName;
    this.instantConfirmation = props.instantConfirmation;
    this.availabilityLocalStartTimes = props.availabilityLocalStartTimes;
  }
}

export class ViatorGetMappingService implements SpecificResellerGetMappingService<ViatorMappingModel> {
  private readonly connectedProductUuids = [
    '9cbd7f33-6b53-45c4-a44b-730605f68753',
    'b5c0ab15-6575-4ca4-a39d-a8c7995ccbda',
    'bb9eb918-fcb5-4947-9fce-86586bbea111',
    '0a8f2ef2-7469-4ef0-99fa-a67132ab0bce',
  ];

  public async getMapping(productModels: ProductModel[]): Promise<ViatorMappingModel[]> {
    return productModels
      .map((productModel) =>
        productModel.optionModels.map((optionModel) =>
          optionModel.unitModels.map((unitModel) => {
            const resellerReference = [productModel.id, optionModel.id].join('-');
            const random = new Prando(resellerReference);

            return new ViatorMappingModel({
              id: DataGenerator.generateUUID(),
              resellerReference,
              resellerStatus: ResellerStatus.ACTIVE,
              title: productModel.internalName,
              url: '',
              webhookUrl: null,
              optionRequired: true,
              unitRequired: false,
              productId: productModel.id,
              optionId: optionModel.id,
              unitId: unitModel.id,
              unitType: unitModel.type,
              connected: this.connectedProductUuids.includes(productModel.id),
              viatorRecurringPriceSync: random.nextBoolean(),
              availabilityType: productModel.availabilityType,
              timeZone: productModel.timeZone,
              restrictions: optionModel.restrictions,
              unitRestrictions: unitModel.restrictions,
              optionInternalName: optionModel.internalName ?? 'DEFAULT',
              instantConfirmation: productModel.instantConfirmation,
              availabilityLocalStartTimes: optionModel.availabilityLocalStartTimes,
            });
          }),
        ),
      )
      .flat(2);
  }
}
