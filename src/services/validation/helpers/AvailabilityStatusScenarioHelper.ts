import { Availability, AvailabilityStatus, Product } from "@octocloud/types";
import { ScenarioHelper } from "./ScenarioHelper";
import { Result } from "../api/types";
import { Config } from "../config/Config";
import { AvailabilityValidator } from "../../../validators/backendValidator/Availability/AvailabilityValidator";
import * as R from "ramda";
import { ValidatorError } from "../../../validators/backendValidator/ValidatorHelpers";

export interface AvailabilityScenarioData {
  name: string;
  startTimes: ProductResults[];
  openingHours: ProductResults[];
}

interface ProductResults {
  result: Result<Availability[]>;
  product: Product;
}

export class AvailabilityStatusScenarioHelper extends ScenarioHelper {
  private config = Config.getInstance();

  private setProduct = (data: ProductResults[]): ValidatorError[] => {
    const ids = [];
    for (const result of data) {
      const validator = new AvailabilityValidator({
        capabilities: this.config.getCapabilityIDs(),
        availabilityType: result.product.availabilityType,
      });
      const errors = result.result.data
        .map((availability) => validator.validate(availability))
        .flat(1);
      if (R.isEmpty(errors)) {
        const available = result.result.data.filter(
          (availability) =>
            availability.status === AvailabilityStatus.AVAILABLE ||
            availability.status === AvailabilityStatus.FREESALE
        );
        const soldout = result.result.data.filter(
          (availability) => availability.status === AvailabilityStatus.SOLD_OUT
        );
        if (available.length > 1 && !R.isEmpty(soldout)) {
          this.config.setAvailability(
            result.product,
            [available[0].id, available[1].id],
            soldout[0].id
          );
          ids.push(result.product.id);
        }
      }
      if (ids.length > 1) {
        break;
      }
    }
    if (ids.length < 2) {
      return [
        new ValidatorError({
          message: `Missing START_TIME products with AVAILABLE and SOLD_OUT availability status`,
        }),
      ];
    }
  };

  public validateAvailability = (data: AvailabilityScenarioData) => {
    const errors: ValidatorError[] = [];

    this.setProduct(data.startTimes);
    this.setProduct(data.openingHours);

    return this.handleResult({
      name: data.name,
      success: R.isEmpty(errors),
      result: {
        response: {
          data: {
            status: null,
            body: null,
          },
          error: null,
        },
        request: {
          url: null,
          body: null,
        },
        data: null,
      },
      errors,
    });
  };
}
