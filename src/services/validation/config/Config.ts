import {
  AvailabilityType,
  PricingPer,
  DeliveryMethod,
  CapabilityId,
} from "@octocloud/types";

export class Config {
  public url: string;
  public capabilities: CapabilityId[];
  public supplierId: string;
  private productStartTimes: Nullable<ProductValidatorConfig>;
  private productOpeningHours: Nullable<ProductValidatorConfig>;

  constructor({
    url,
    capabilities,
    supplierId,
    productStartTimes,
    productOpeningHours,
  }: {
    capabilities: CapabilityId[];
    url: string;
    supplierId: string;
    productStartTimes?: ProductValidatorConfig;
    productOpeningHours?: ProductValidatorConfig;
  }) {
    this.url = url;
    this.capabilities = capabilities;
    this.supplierId = supplierId;
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

export class SupplierValidatorConfig {
  public supplierId: string;

  constructor({ supplierId }: { supplierId: string }) {
    this.supplierId = supplierId;
  }
}

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
