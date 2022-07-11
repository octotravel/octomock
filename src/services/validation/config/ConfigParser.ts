import { AvailabilityType } from "@octocloud/types";
import {
  SchemaValidator,
  validationConfigSchema,
} from "../../../schemas/Validation";
import { Config, ProductValidatorConfig } from "./Config";

export class ConfigParser {
  private schemaValidator = new SchemaValidator();
  public parse = async (data: any): Promise<Config> => {
    await this.schemaValidator.validateSchema(validationConfigSchema, data);
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
    });
  };
  private parseProduct = (
    data: any,
    availabilityType: AvailabilityType
  ): ProductValidatorConfig => {
    return new ProductValidatorConfig({
      productId: data.productId,
      optionId: data.optionId,
      available: data.available,
      unavailable: data.unavailable,
      startTime: data.startTime,
      pricingPer: data.pricingPer,
      deliveryMethods: data.deliveryMethods,
      availabilityType,
    });
  };
}
