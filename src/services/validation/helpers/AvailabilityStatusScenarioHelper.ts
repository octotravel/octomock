import * as R from "ramda";
import { Availability, AvailabilityStatus, Product } from "@octocloud/types";
import { ScenarioHelper } from "./ScenarioHelper";
import { Result } from "../api/types";
import { Config, ErrorResult } from "../config/Config";
import {
  ErrorType,
  ValidatorError,
} from "../../../validators/backendValidator/ValidatorHelpers";
import { ProductBookable } from "../config/ProductBookable";
import descriptions from "../consts/descriptions";

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

  public findSoldOutProduct = (
    data: ProductResults[]
  ): ErrorResult<ProductBookable> => {
    const result =
      data.find(({ result }) => {
        const availabilities = result.data;
        const availabilitiessSoldOut = availabilities.filter(
          (availability) => availability.status === AvailabilityStatus.SOLD_OUT
        );
        return R.compose(R.not, R.isEmpty)(availabilitiessSoldOut);
      }) ?? null;

    if (result === null) {
      this.config.ignoreKill = false;
      return {
        error: new ValidatorError({
          type: ErrorType.CRITICAL,
          message: "There was not found availability with status=SOLD_OUT",
        }),
        data: null,
      };
    }

    const availability = result.result.data.find(
      (a) => a.status === AvailabilityStatus.SOLD_OUT
    );
    return {
      data: new ProductBookable({
        product: result.product,
        availabilityIdSoldOut: availability.id,
        availabilityIdAvailable: null,
      }),
      error: null,
    };
  };

  public findAvailableProducts = (
    data: ProductResults[],
    { count = 2 }: { count: number }
  ): ErrorResult<ProductBookable[]> => {
    const result =
      data.filter(({ result }) => {
        const availabilities = result.data;
        const availabilitiesAvailable = availabilities.filter(
          (availability) =>
            (availability.status === AvailabilityStatus.AVAILABLE ||
              AvailabilityStatus.FREESALE ||
              AvailabilityStatus.LIMITED) &&
            availability.available
        );
        return (
          R.compose(R.not, R.isEmpty)(availabilitiesAvailable) &&
          availabilitiesAvailable.length > 1
        );
      }) ?? null;

    if (result.length < 1) {
      this.config.ignoreKill = false;
      return {
        error: new ValidatorError({
          type: ErrorType.CRITICAL,
          message: "There was not found availability that is available",
        }),
        data: null,
      };
    }

    if (result.length < count) {
      this.config.ignoreKill = false;
      return {
        error: new ValidatorError({
          type: ErrorType.CRITICAL,
          message: `There is not enough suitable product for validation. At least ${count} avalilable products are required`,
        }),
        data: null,
      };
    }

    const produts = R.take(count)(result).map(({ product, result }) => {
      const availabilityIDs = result.data
        .filter(
          (a) =>
            (a.status === AvailabilityStatus.AVAILABLE ||
              AvailabilityStatus.FREESALE ||
              AvailabilityStatus.LIMITED) &&
            a.available
        )
        .map((a) => a.id);
      return new ProductBookable({
        product,
        availabilityIdSoldOut: null,
        availabilityIdAvailable: availabilityIDs,
      });
    });

    return {
      error: null,
      data: produts,
    };
  };

  public validateAvailability = (data: AvailabilityScenarioData) => {
    const errors: ValidatorError[] = [];

    const products = [...data.openingHours, ...data.startTimes];
    const soldOutData = this.findSoldOutProduct(products);
    if (soldOutData.error !== null) {
      errors.push(soldOutData.error);
    } else {
      this.config.productConfig.soldOutProduct = soldOutData.data;
    }
    const availableData = this.findAvailableProducts(products, { count: 2 });
    if (availableData.error !== null) {
      errors.push(availableData.error);
    } else {
      this.config.productConfig.availableProducts = [
        availableData.data[0],
        availableData.data[1],
      ];
    }
    return this.handleResult({
      name: data.name,
      result: {
        response: {
          headers: {},
          data: {
            status: null,
            body: null,
          },
          error: null,
        },
        request: {
          headers: {},
          url: null,
          method: null,
          body: null,
        },
        data: null,
      },
      errors,
      description: descriptions.availabilityCheckStatus,
    });
  };
}
