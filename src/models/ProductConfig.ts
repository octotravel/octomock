import { PricingUnit, Pricing } from "./../types/Pricing";
import { PricingConfig } from "./../builders/ProductBuilder";
import { AvailabilityConfigModel } from "./AvailabilityConfig";
import { OptionConfigModel } from "./OptionConfig";
import { DeliveryMethod } from "../types/Product";
import { isEmpty } from "ramda";

export class ProductConfigModel {
  public id: string;
  public name: string;
  public availabilityConfig: AvailabilityConfigModel;
  public optionsConfig: OptionConfigModel[];
  public pricingConfig: PricingConfig;
  public deliveryMethods: DeliveryMethod[];

  constructor({
    id,
    name,
    availabilityConfig,
    optionsConfig,
    pricingConfig,
    deliveryMethods,
  }: {
    id: string;
    name: string;
    availabilityConfig: AvailabilityConfigModel;
    optionsConfig: OptionConfigModel[];
    pricingConfig: PricingConfig;
    deliveryMethods?: DeliveryMethod[];
  }) {
    this.id = id;
    this.name = name;
    this.availabilityConfig = availabilityConfig.setPricing(
      optionsConfig,
      pricingConfig
    );
    this.optionsConfig = optionsConfig;
    this.pricingConfig = pricingConfig;
    this.deliveryMethods = deliveryMethods ?? [
      DeliveryMethod.TICKET,
      DeliveryMethod.VOUCHER,
    ];

    if (isEmpty(this.deliveryMethods)) {
      throw new Error("product has to contain at least 1 DeliveryMethod");
    }
  }

  private getOptionConfig = (optionId: string): OptionConfigModel => {
    const config =
      this.optionsConfig.find((optionConfig) => optionConfig.id === optionId) ??
      null;
    if (config === null) {
      throw new Error(`option ${optionId} does not exist`);
    }
    return config;
  };

  public getUnitPricing = (optionId: string): PricingUnit[] => {
    const optionConfig = this.getOptionConfig(optionId);
    const result = optionConfig.unitConfigModels.map((unitConfig) => {
      return unitConfig.pricingFrom.map((pricing) => {
        return {
          ...pricing,
          unitId: unitConfig.id,
        };
      });
    });
    return result.flat(1);
  };

  public getPricing = (optionId: string): Pricing => {
    const optionConfig = this.getOptionConfig(optionId);
    return optionConfig.pricingFrom[0];
  };
}
