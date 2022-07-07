import { AvailabilityType } from "@octocloud/types";
import {
  Config,
  ProductValidatorConfig,
  AvailabilityValidatorConfig,
} from "./Config";

export class ConfigParser {
  public parse = (data: any): Config => {
    // TODO: create schema for validating the config
    return new Config({
      url: data.url,
      capabilities: data.capabilities ?? [],
      supplierId: data.supplierId,
      productOpeningHours:
        data.productOpeningHours &&
        this.parseProduct(
          data.productOpeningHours,
          AvailabilityType.OPENING_HOURS
        ),
      productStartTimes:
        data.productStartTimes &&
        this.parseProduct(data.productStartTimes, AvailabilityType.START_TIME),
      availabilityOpeningHours:
        data.availabilityOpeningHours &&
        this.parseAvailability(
          data.availabilityOpeningHours,
          AvailabilityType.OPENING_HOURS
        ),
      availabilityStartTimes:
        data.availabilityStartTimes &&
        this.parseAvailability(
          data.availabilityStartTimes,
          AvailabilityType.START_TIME
        ),
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
  private parseAvailability = (
    data: any,
    availabilityType: AvailabilityType
  ): AvailabilityValidatorConfig => {
    return new AvailabilityValidatorConfig({
      productId: data.productId,
      optionId: data.optionId,
      dateNotAvailable: data.dateNotAvailable,
      dateFrom: data.dateFrom,
      dateTo: data.dateTo,
      availabilityType,
    });
  };
}
