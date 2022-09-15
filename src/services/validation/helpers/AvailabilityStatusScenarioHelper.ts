import { Availability, AvailabilityStatus, Product } from "@octocloud/types";
import { ScenarioHelper } from "./ScenarioHelper";
import { Result } from "../api/types";
import { Config } from "../config/Config";
import { AvailabilityValidator } from "../../../validators/backendValidator/Availability/AvailabilityValidator";
import * as R from "ramda";
import { ValidatorError } from "../../../validators/backendValidator/ValidatorHelpers";

export interface AvailabilityScenarioData {
  name: string;
  startTimes: {
    result: Result<Availability[]>;
    product: Product;
  }[];
  openingHours: {
    result: Result<Availability[]>;
    product: Product;
  }[];
}

export class AvailabilityStatusScenarioHelper extends ScenarioHelper {
  private config = Config.getInstance();

  public validateAvailability = (data: AvailabilityScenarioData) => {
    const errors: ValidatorError[] = [];
    const stIds = [];

    for (const startTime of data.startTimes) {
      const validator = new AvailabilityValidator({
        capabilities: this.config.getCapabilityIDs(),
        availabilityType: startTime.product.availabilityType,
      });
      const errors = startTime.result.data
        .map((availability) => validator.validate(availability))
        .flat(1);
      if (R.isEmpty(errors)) {
        const available = startTime.result.data.filter(
          (availability) =>
            availability.status === AvailabilityStatus.AVAILABLE ||
            availability.status === AvailabilityStatus.FREESALE
        );
        const soldout = startTime.result.data.filter(
          (availability) => availability.status === AvailabilityStatus.SOLD_OUT
        );
        if (available.length > 1 && !R.isEmpty(soldout)) {
          this.config.setAvailability(
            startTime.product,
            [available[0].id, available[1].id],
            soldout[0].id
          );
          stIds.push(startTime.product.id);
        }
      }
      if (stIds.length > 1) {
        break;
      }
    }
    if (stIds.length < 2) {
      errors.push(
        new ValidatorError({
          message: `Missing START_TIME products with AVAILABLE and SOLD_OUT availability status`,
        })
      );
    }

    const ohIds = [];

    for (const openingHour of data.openingHours) {
      const validator = new AvailabilityValidator({
        capabilities: this.config.getCapabilityIDs(),
        availabilityType: openingHour.product.availabilityType,
      });
      const errors = openingHour.result.data
        .map((availability) => validator.validate(availability))
        .flat(1);
      if (R.isEmpty(errors)) {
        const available = openingHour.result.data.filter(
          (availability) =>
            availability.status === AvailabilityStatus.AVAILABLE ||
            availability.status === AvailabilityStatus.FREESALE
        );
        const soldout = openingHour.result.data.filter(
          (availability) => availability.status === AvailabilityStatus.SOLD_OUT
        );
        if (available.length > 1 && !R.isEmpty(soldout)) {
          this.config.setAvailability(
            openingHour.product,
            [available[0].id, available[1].id],
            soldout[0].id
          );
          ohIds.push(openingHour.product.id);
        }
      }
      if (ohIds.length > 1) {
        break;
      }
    }
    if (ohIds.length < 2) {
      errors.push(
        new ValidatorError({
          message: `Missing OPENING_HOUR products with AVAILABLE and SOLD_OUT availability status`,
        })
      );
    }

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
