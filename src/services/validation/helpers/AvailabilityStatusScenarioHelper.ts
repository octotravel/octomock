import * as R from "ramda";
import { Availability, AvailabilityStatus, Product } from "@octocloud/types";
import { ScenarioHelper } from "./ScenarioHelper";
import { Result } from "../api/types";
import { ErrorResult } from "../config/Config";
import {
  ErrorType,
  ValidatorError,
} from "../../../validators/backendValidator/ValidatorHelpers";
import { ProductBookable } from "../config/ProductBookable";
import descriptions from "../consts/descriptions";

export interface AvailabilityScenarioData {
  name: string;
  products: ProductResults[];
}

interface ProductResults {
  result: Result<Availability[]>;
  product: Product;
}

export class AvailabilityStatusScenarioHelper extends ScenarioHelper {
  public validateAvailability = (data: AvailabilityScenarioData) => {
    const errors: ValidatorError[] = [];

    const products = data.products;
    const soldOutData = this.findSoldOutProduct(products);
    if (soldOutData.error !== null) {
      errors.push(soldOutData.error);
    } else {
      this.config.productConfig.soldOutProduct = soldOutData.data;
    }
    const availableData = this.findAvailableProducts(products);
    if (availableData.error !== null) {
      errors.push(availableData.error);
    } else {
      this.config.productConfig.availableProducts = availableData.data;
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
      this.config.terminateValidation = true;
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
    data: ProductResults[]
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
      this.config.terminateValidation = true;
      return {
        error: new ValidatorError({
          type: ErrorType.CRITICAL,
          message: "There was not found availability that is available",
        }),
        data: null,
      };
    }

    const produts = result.map(({ product, result }) => {
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
}
