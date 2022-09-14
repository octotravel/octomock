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
    let stAvailable = false;
    let stSoldOut = false;

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
        if (!R.isEmpty(available)) {
          this.config.setAvailability(available[0], startTime.product);
          stAvailable = true;
        }
        if (!R.isEmpty(soldout)) {
          this.config.setAvailability(soldout[0], startTime.product);
          stSoldOut = true;
        }
      }
      if (stAvailable && stSoldOut) {
        break;
      }
    }
    if (!stAvailable || !stSoldOut) {
      errors.push(
        new ValidatorError({
          message: `Missing ${
            !stAvailable ? "AVAILABLE" : "SOLD_OUT"
          } availability for START_TIME product!`,
        })
      );
    }

    let ohAvailable = false;
    let ohSoldOut = false;

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
        if (!R.isEmpty(available)) {
          this.config.setAvailability(available[0], openingHour.product);
          ohAvailable = true;
        }
        if (!R.isEmpty(soldout)) {
          this.config.setAvailability(soldout[0], openingHour.product);
          ohSoldOut = true;
        }
      }
      if (ohAvailable && ohSoldOut) {
        break;
      }
    }
    if (!ohAvailable || !ohSoldOut) {
      errors.push(
        new ValidatorError({
          message: `Missing ${
            !ohAvailable ? "AVAILABLE | FREESALE" : "SOLD_OUT"
          } availability for OPENING_HOURS product!`,
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
