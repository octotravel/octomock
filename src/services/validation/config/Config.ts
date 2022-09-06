import { CapabilityId } from "@octocloud/types";
import { ProductValidatorData } from "./ProductValidatorData";

export class Config {
  public url: string;
  public apiKey: string;
  public capabilities: CapabilityId[];

  public startTimesProducts: ProductValidatorData;
  public openingHoursProducts: ProductValidatorData;
  public availabilityRequiredFalseProducts: ProductValidatorData;

  public ignoreKill: boolean;

  constructor({
    url,
    apiKey,
    capabilities,

    startTimesProducts,
    openingHoursProducts,
    availabilityRequiredFalseProducts,

    ignoreKill,
  }: {
    url: string;
    apiKey: string;
    capabilities: CapabilityId[];

    startTimesProducts?: ProductValidatorData;
    openingHoursProducts?: ProductValidatorData;
    availabilityRequiredFalseProducts?: ProductValidatorData;

    ignoreKill: boolean;
  }) {
    this.url = url;
    this.apiKey = apiKey;
    this.capabilities = capabilities;

    this.startTimesProducts = startTimesProducts ?? null;
    this.openingHoursProducts = openingHoursProducts ?? null;
    this.availabilityRequiredFalseProducts =
      availabilityRequiredFalseProducts ?? null;

    this.ignoreKill = ignoreKill;
  }
}
