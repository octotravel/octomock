import { OptionModel } from "./../models/Option";
import { OptionBuilder } from "./OptionBuilder";
import { Currency } from "./../types/Currency";
import { PricingPer } from "./../types/Pricing";
import { ProductModel } from "./../models/Product";
import { OptionConfigModel } from "../models/OptionConfig";
import { AvailabilityConfigModel } from "../models/AvailabilityConfig";

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

interface ProductBuilderData {
  id: string;
  name: string;
  optionsConfig: OptionConfigModel[];
  pricingConfig?: PricingConfig;
  availabilityConfig: AvailabilityConfigModel;
}

export class ProductBuilder {
  private product: ProductModel;
  private optionBuilder = new OptionBuilder();

  build(data: ProductBuilderData): ProductModel {
    const {
      id,
      name,
      optionsConfig,
      pricingConfig = defaultPricingConfig,
      availabilityConfig,
    } = data;

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
