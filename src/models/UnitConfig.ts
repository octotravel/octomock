import { Pricing } from "../types/Pricing";
import { UnitId } from "../types/Unit";

export class UnitConfigModel {
  public id: UnitId;
  public minAge: number;
  public maxAge: number;
  public idRequired = false;
  public minQuantity: Nullable<number>;
  public maxQuantity: Nullable<number>;
  public pricingFrom?: Pricing[];

  constructor({
    id,
    minAge,
    maxAge,
    minQuantity,
    maxQuantity,
    pricingFrom,
  }: {
    id: UnitId;
    minAge?: number;
    maxAge?: number;
    minQuantity?: Nullable<number>;
    maxQuantity?: Nullable<number>;
    pricingFrom?: Pricing[];
  }) {
    this.id = id;
    this.minAge = minAge ?? 0;
    this.maxAge = maxAge ?? 99;
    this.minQuantity = minQuantity ?? null;
    this.maxQuantity = maxQuantity ?? null;
    this.pricingFrom = pricingFrom;
  }
}
