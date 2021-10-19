import { OptionModel } from "./../models/Option";
import { OptionBuilder } from "./OptionBuilder";
import { Currency } from "./../types/Currency";
import { PricingPer } from "./../types/Pricing";
import { ProductModel } from "./../models/Product";
import { CapabilityId } from "./../types/Capability";
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
  capabilities?: CapabilityId[];
  availabilityConfig: AvailabilityConfigModel;
}

export class ProductBuilder {
  private product: ProductModel;
  private optionBuilder = new OptionBuilder();

  build(data: ProductBuilderData): ProductModel {
    const {
      id,
      name,
      capabilities = [],
      optionsConfig,
      pricingConfig = defaultPricingConfig,
      availabilityConfig,
    } = data;

    this.product = new ProductModel({
      id,
      internalName: name,
      availabilityType: availabilityConfig.availabilityType,
      openingHours: availabilityConfig.openingHours,
      options: this.generateOptionModels(
        optionsConfig,
        pricingConfig,
        capabilities
      ),
      availabilityConfig,
    });

    if (capabilities.includes(CapabilityId.Content)) {
      this.product = this.product.addContent();
    }

    if (capabilities.includes(CapabilityId.Pricing)) {
      this.product = this.product.addPricing(
        pricingConfig.pricingPer,
        pricingConfig.currency
      );
    }

    if (capabilities.includes(CapabilityId.Pickups)) {
      this.product = this.product.addPickup();
    }

    return this.product;
  }

  private generateOptionModels = (
    optionsConfig: OptionConfigModel[],
    pricingConfig: PricingConfig,
    capabilities: CapabilityId[]
  ): OptionModel[] => {
    return optionsConfig.map((optionConfig, index) =>
      this.optionBuilder.build({
        primary: index === 0,
        capabilities,
        pricingPer: pricingConfig.pricingPer,
        optionConfig,
      })
    );
  };
}
