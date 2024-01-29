export enum OfferDiscountType {
  FLAT = 'FLAT',
  PERCENTAGE = 'PERCENTAGE',
}

export class OfferDiscountModel {
  public readonly type: OfferDiscountType;

  public readonly amount: number;

  public constructor({ type, amount }: { type: OfferDiscountType; amount: number }) {
    this.type = type;
    this.amount = amount;
  }
}
