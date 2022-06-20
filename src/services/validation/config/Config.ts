import {
  AvailabilityType,
  PricingPer,
  DeliveryMethod,
  CapabilityId,
} from "@octocloud/types";

export class Config {
  public url: string;
  public capabilities: CapabilityId[];
  private productStartTimes: Nullable<ProductValidatorConfig>;
  private productOpeningHours: Nullable<ProductValidatorConfig>;

  constructor({
    url,
    capabilities,
    productStartTimes,
    productOpeningHours,
  }: {
    capabilities: CapabilityId[];
    url: string;
    productStartTimes?: ProductValidatorConfig;
    productOpeningHours?: ProductValidatorConfig;
  }) {
    this.url = url;
    this.capabilities = capabilities;
    this.productStartTimes = productStartTimes ?? null;
    this.productOpeningHours = productOpeningHours ?? null;
  }

  public getAvailabilityTypes = (): AvailabilityType[] => {
    const types: AvailabilityType[] = [];
    if (this.productStartTimes) {
      types.push(AvailabilityType.START_TIME);
    }
    if (this.productOpeningHours) {
      types.push(AvailabilityType.OPENING_HOURS);
    }
    return types;
  };

  public getProductConfigs = (): ProductValidatorConfig[] => {
    const configs: ProductValidatorConfig[] = [];
    if (this.productStartTimes) {
      configs.push(this.productStartTimes);
    }
    if (this.productOpeningHours) {
      configs.push(this.productOpeningHours);
    }
    return configs;
  };
}

export class ProductValidatorConfig {
  public productId: string;
  public optionId: Nullable<string>;
  public dateAvailable: string;
  public dateNotAvailable: string;
  public startTime: Nullable<string>;
  public pricingPer: PricingPer;
  public deliveryMethods: DeliveryMethod[];
  public availabilityType: AvailabilityType;

  constructor({
    productId,
    optionId,
    dateAvailable,
    dateNotAvailable,
    startTime,
    availabilityType,
    pricingPer,
    deliveryMethods,
  }: {
    productId: string;
    optionId?: string;
    dateAvailable: string;
    dateNotAvailable: string;
    startTime?: string;
    pricingPer?: PricingPer;
    deliveryMethods: DeliveryMethod[];
    availabilityType: AvailabilityType;
  }) {
    this.productId = productId;
    this.optionId = optionId ?? null;
    this.dateAvailable = dateAvailable;
    this.dateNotAvailable = dateNotAvailable;
    this.startTime = startTime ?? null;
    this.pricingPer = pricingPer ?? PricingPer.UNIT;
    this.deliveryMethods = deliveryMethods;
    this.availabilityType = availabilityType;
  }
}
