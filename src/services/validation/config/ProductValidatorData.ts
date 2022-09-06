import { Product } from "@octocloud/types";

export interface ProductAvailabilityData {
  productId: string;
  optionId: string;
  availabilityId: string;
}

export class ProductValidatorData {
  public products: Product[];
  public availabilitySoldOut: Nullable<ProductAvailabilityData>;
  public availabilityAvailable: Nullable<ProductAvailabilityData>;
  constructor({
    products,
    availabilitySoldOut,
    availabilityAvailable,
  }: {
    products: Product[];
    availabilitySoldOut: Nullable<ProductAvailabilityData>;
    availabilityAvailable: Nullable<ProductAvailabilityData>;
  }) {
    this.products = products;
    this.availabilitySoldOut = availabilitySoldOut ?? null;
    this.availabilityAvailable = availabilityAvailable ?? null;
  }
}
