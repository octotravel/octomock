import * as R from "ramda";
import { OptionModel } from "./../models/Option";
import { OptionBuilder } from "./OptionBuilder";
import { Currency } from "./../types/Currency";
import { UnitId } from "./../types/Unit";
import { PricingPer } from "./../types/Pricing";
import { ProductModel } from "./../models/Product";
import { CapabilityId } from "./../types/Capability";
import { AvailabilityType } from "./../types/Availability";

interface OptionConfig {
  id: string;
  name: string;
}

const defaultOptionConfig: OptionConfig = {
  id: "DEFAULT",
  name: "Default Option",
};

interface ProductBuilderData {
  id: string;
  name: string;
  units: UnitId[];
  availabilityType: AvailabilityType;
  optionsConfig?: OptionConfig[];
  capabilities?: CapabilityId[];
  pricingPer?: PricingPer;
  currency?: Currency;
}

export class ProductBuilder {
  private product: ProductModel;
  private optionBuilder = new OptionBuilder();

  build(data: ProductBuilderData): ProductModel {
    const {
      id,
      name,
      availabilityType,
      capabilities = [],
      pricingPer,
      currency = Currency.EUR,
      units,
      optionsConfig = [defaultOptionConfig],
    } = data;

    this.product = new ProductModel({
      id,
      internalName: name,
      availabilityType,
      options: this.generateOptionModels(
        optionsConfig,
        units,
        capabilities,
        pricingPer,
        currency
      ),
    });

    if (capabilities.includes(CapabilityId.Content)) {
      this.product = this.product.addContent();
    }

    if (capabilities.includes(CapabilityId.Pricing)) {
      if (R.isNil(pricingPer)) {
        throw new Error(
          "pricingPer is required when Pricing Capability is provided"
        );
      }
      if (R.isNil(currency)) {
        throw new Error(
          "currency is required when Pricing Capability is provided"
        );
      }
      this.product = this.product.addPricing(pricingPer, currency);
    }

    if (capabilities.includes(CapabilityId.Pickups)) {
      this.product = this.product.addPickup();
    }

    return this.product;
  }

  private generateOptionModels = (
    optionsConfig: OptionConfig[],
    units: UnitId[],
    capabilities: CapabilityId[],
    pricingPer: PricingPer,
    currency: Currency
  ): OptionModel[] => {
    return optionsConfig.map(({ id, name }, index) =>
      this.optionBuilder.build({
        id,
        primary: index === 0,
        name,
        units,
        capabilities,
        pricingPer,
        currency,
      })
    );
  };
}
