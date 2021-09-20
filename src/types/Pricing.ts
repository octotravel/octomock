export enum PricingPer {
  UNIT = "UNIT",
  BOOKING = "BOOKING",
}
export interface Pricing {
  original: number;
  retail: number;
  net: Nullable<number>;
  currency: string;
  currencyPrecision: number;
  includedTaxes: Array<Tax>;
}

export interface PricingUnit extends Pricing {
  unitId: string;
}

export interface Tax {
  name: string;
  retail: number;
  original: number;
  net: Nullable<number>;
}
