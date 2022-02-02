import { ProductConfigModel } from "./../models/ProductConfig";
import { OptionModel } from "./../models/Option";
import { OptionBuilder } from "./OptionBuilder";
import { Currency } from "./../types/Currency";
import { PricingPer } from "./../types/Pricing";
import { ProductModel } from "./../models/Product";
import { OptionConfigModel } from "../models/OptionConfig";

export interface PricingConfig {
  currencies: Currency[];
  pricingPer: PricingPer;
  currency: Currency;
}

const defaultPricingConfig: PricingConfig = {
  currencies: [Currency.EUR],
  pricingPer: PricingPer.UNIT,
  currency: Currency.EUR,
};

export class ProductBuilder {
  private product: ProductModel;
  private optionBuilder = new OptionBuilder();

  build(config: ProductConfigModel): ProductModel {
    const {
      id,
      name,
      optionsConfig,
      pricingConfig = defaultPricingConfig,
      availabilityConfig,
    } = config;

    this.product = new ProductModel({
      id,
      internalName: name,
      availabilityType: availabilityConfig.availabilityType,
      options: this.generateOptionModels(optionsConfig, pricingConfig),
      pricingPer: pricingConfig.pricingPer,
      currency: pricingConfig.currency,
      availabilityConfig,
    });

    return this.product;
  }

  private generateOptionModels = (
    optionsConfig: OptionConfigModel[],
    pricingConfig: PricingConfig
  ): OptionModel[] => {
    return optionsConfig.map((optionConfig, index) =>
      this.optionBuilder.build({
        primary: index === 0,
        pricingPer: pricingConfig.pricingPer,
        optionConfig,
      })
    );
  };
}
