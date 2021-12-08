import { PricingConfig } from "./../builders/ProductBuilder";
import { AvailabilityConfigModel } from "./AvailabilityConfig";
import { OptionConfigModel } from "./OptionConfig";

export class ProductConfigModel {
  public id: string;
  public name: string;
  public availabilityConfig: AvailabilityConfigModel;
  public optionsConfig: OptionConfigModel[];
  public pricingConfig: PricingConfig;

  constructor({
    id,
    name,
    availabilityConfig,
    optionsConfig,
    pricingConfig,
  }: {
    id: string;
    name: string;
    availabilityConfig: AvailabilityConfigModel;
    optionsConfig: OptionConfigModel[];
    pricingConfig: PricingConfig;
  }) {
    this.id = id;
    this.name = name;
    this.availabilityConfig = availabilityConfig;
    this.optionsConfig = optionsConfig;
    this.pricingConfig = pricingConfig;
  }
}
