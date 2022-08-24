import { AvailabilityType, CapabilityId } from "@octocloud/types";
import { ProductValidatorConfig } from "./ProductValidatorConfig";

export class Config {
  public url: string;
  public capabilities: CapabilityId[];
  public supplierId: string;
  private productStartTimes: Nullable<ProductValidatorConfig>;
  private productOpeningHours: Nullable<ProductValidatorConfig>;
  public apiKey: string;

  constructor({
    url,
    capabilities,
    supplierId,
    productStartTimes,
    productOpeningHours,
    apiKey,
  }: {
    capabilities: CapabilityId[];
    url: string;
    supplierId: string;
    productStartTimes?: ProductValidatorConfig;
    productOpeningHours?: ProductValidatorConfig;
    apiKey: string;
  }) {
    this.url = url;
    this.capabilities = capabilities;
    this.supplierId = supplierId;
    this.productStartTimes = productStartTimes ?? null;
    this.productOpeningHours = productOpeningHours ?? null;
    this.apiKey = apiKey;
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
