import { AvailabilityType, DeliveryMethod } from "@octocloud/types";
import { ValidationConfig } from "../../../schemas/Validation";
import { Config } from "./Config";
import { ProductValidatorConfig } from "./ProductValidatorConfig";

export class ConfigParser {
  public parse = async (data: ValidationConfig): Promise<Config> => {
    return new Config({
      url: data.backend.endpoint,
      capabilities: [],
      supplierId: "ed48697d-4591-4e56-8034-523acef6ad2d",
      productOpeningHours: this.parseProduct(
        {
          productId: "365b524a-d1ba-4d24-8663-65bef0584341",
          optionId: "28d36b0f-421b-4954-a573-a53b1154e6f5",
          available: {
            from: "2022-12-01",
            to: "2022-12-02",
          },
          unavailable: {
            from: "2022-12-03",
            to: "2022-12-03",
          },
          deliveryMethods: [DeliveryMethod.TICKET, DeliveryMethod.VOUCHER],
          availabilityType: AvailabilityType,
        },
        AvailabilityType.OPENING_HOURS
      ),
      apiKey: data.backend.apiKey,
      ignoreKill: true,
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
