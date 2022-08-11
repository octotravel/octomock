import { AvailabilityType, DeliveryMethod, PricingPer } from "@octocloud/types";

export class ProductValidatorConfig {
  public productId: string;
  public optionId: Nullable<string>;
  public available: {
    from: string;
    to: string;
  };
  public unavailable: {
    from: string;
    to: string;
  };
  public startTime: Nullable<string>;
  public pricingPer: PricingPer;
  public deliveryMethods: DeliveryMethod[];
  public availabilityType: AvailabilityType;

  constructor({
    productId,
    optionId,
    available,
    unavailable,
    startTime,
    availabilityType,
    pricingPer,
    deliveryMethods,
  }: {
    productId: string;
    optionId?: string;
    available: {
      from: string;
      to: string;
    };
    unavailable: {
      from: string;
      to: string;
    };
    startTime?: string;
    pricingPer?: PricingPer;
    deliveryMethods: DeliveryMethod[];
    availabilityType: AvailabilityType;
  }) {
    this.productId = productId;
    this.optionId = optionId ?? null;
    this.available = available;
    this.unavailable = unavailable;
    this.startTime = startTime ?? null;
    this.pricingPer = pricingPer ?? PricingPer.UNIT;
    this.deliveryMethods = deliveryMethods;
    this.availabilityType = availabilityType;
  }
}
