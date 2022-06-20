import { AvailabilityType } from "@octocloud/types";
import { Config, ProductValidatorConfig } from "./Config";

export class ConfigParser {
  public parse = (data: any): Config => {
    // TODO: create schema for validating the config
    return new Config({
      url: data.url,
      capabilities: data.capabilities ?? [],
      productOpeningHours:
        data.productOpeningHours &&
        this.parseProduct(
          data.productOpeningHours,
          AvailabilityType.OPENING_HOURS
        ),
      productStartTimes:
        data.productStartTimes &&
        this.parseProduct(data.productStartTimes, AvailabilityType.START_TIME),
    });
  };
  private parseProduct = (
    data: any,
    availabilityType: AvailabilityType
  ): ProductValidatorConfig => {
    return new ProductValidatorConfig({
      productId: data.productId,
      optionId: data.optionId,
      dateAvailable: data.dateAvailable,
      dateNotAvailable: data.dateNotAvailable,
      startTime: data.startTime,
      pricingPer: data.pricingPer,
      deliveryMethods: data.deliveryMethods,
      availabilityType,
    });
  };
}
