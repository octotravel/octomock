import { Pricing, UnitType } from '@octocloud/types';

export class UnitConfigModel {
  public id: string;
  public type: UnitType
  public minAge: number;
  public maxAge: number;
  public idRequired = false;
  public minQuantity: Nullable<number>;
  public maxQuantity: Nullable<number>;
  public pricingFrom?: Pricing[];

  constructor({
    id,
    type,
    minAge,
    maxAge,
    minQuantity,
    maxQuantity,
    pricingFrom,
  }: {
    id: string;
    type: UnitType
    minAge?: number;
    maxAge?: number;
    minQuantity?: Nullable<number>;
    maxQuantity?: Nullable<number>;
    pricingFrom?: Pricing[];
  }) {
    this.id = id;
    this.type = type;
    this.minAge = minAge ?? 0;
    this.maxAge = maxAge ?? 99;
    this.minQuantity = minQuantity ?? null;
    this.maxQuantity = maxQuantity ?? null;
    this.pricingFrom = pricingFrom;
  }
}
