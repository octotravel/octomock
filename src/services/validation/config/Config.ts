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
  private availabilityStartTimes: Nullable<AvailabilityValidatorConfig>;
  private availabilityOpeningHours: Nullable<AvailabilityValidatorConfig>;

  constructor({
    url,
    capabilities,
    supplierId,
    productStartTimes,
    productOpeningHours,
    availabilityStartTimes,
    availabilityOpeningHours,
  }: {
    capabilities: CapabilityId[];
    url: string;
    supplierId: string;
    productStartTimes?: ProductValidatorConfig;
    productOpeningHours?: ProductValidatorConfig;
    availabilityStartTimes?: AvailabilityValidatorConfig;
    availabilityOpeningHours?: AvailabilityValidatorConfig;
  }) {
    this.url = url;
    this.capabilities = capabilities;
    this.supplierId = supplierId;
    this.productStartTimes = productStartTimes ?? null;
    this.productOpeningHours = productOpeningHours ?? null;
    this.availabilityStartTimes = availabilityStartTimes ?? null;
    this.availabilityOpeningHours = availabilityOpeningHours ?? null;
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

  public getAvailabilityConfigs = (): AvailabilityValidatorConfig[] => {
    const configs: AvailabilityValidatorConfig[] = [];
    if (this.availabilityStartTimes) {
      configs.push(this.availabilityStartTimes);
    }
    if (this.availabilityOpeningHours) {
      configs.push(this.availabilityOpeningHours);
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

export class AvailabilityValidatorConfig {
  public productId: string;
  public optionId: Nullable<string>;
  public dateNotAvailable: string[];
  public dateFrom: string;
  public dateTo: string;
  public availabilityType: AvailabilityType;

  constructor({
    productId,
    optionId,
    dateNotAvailable,
    dateFrom,
    dateTo,
    availabilityType,
  }: {
    productId: string;
    optionId?: string;
    dateNotAvailable: string[];
    dateFrom: string;
    dateTo: string;
    availabilityType: AvailabilityType;
  }) {
    this.productId = productId;
    this.optionId = optionId ?? null;
    this.dateNotAvailable = dateNotAvailable;
    this.dateFrom = dateFrom;
    this.dateTo = dateTo;
    this.availabilityType = availabilityType;
  }
}
