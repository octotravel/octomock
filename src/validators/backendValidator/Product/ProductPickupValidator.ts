import { Product, PickupPoint } from "@octocloud/types";
import {
  StringValidator,
  BooleanValidator,
  ModelValidator,
  ValidatorError,
  NumberValidator,
} from "../ValidatorHelpers";

export class ProductPickupValidator implements ModelValidator {
  private path: string;
  constructor({ path }: { path: string }) {
    this.path = path;
  }
  public validate = (product: Product): ValidatorError[] => {
    return [
      BooleanValidator.validate(
        `${this.path}.pickupAvailable`,
        product.pickupAvailable
      ),
      StringValidator.validate(
        `${this.path}.pickupRequired`,
        product.pickupRequired
      ),
      ...this.validatePickupPoints(product.pickupPoints as PickupPoint[]),
    ].filter(Boolean);
  };

  private validatePickupPoints = (
    pickupPoints: PickupPoint[]
  ): ValidatorError[] => {
    return pickupPoints
      .map((pickupPoint, i) => [
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].id`,
          pickupPoint.id
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].name`,
          pickupPoint.name
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].directions`,
          pickupPoint.direction
        ),
        NumberValidator.validate(
          `${this.path}.pickupPoints[${i}].latitude`,
          pickupPoint.latitude
        ),
        NumberValidator.validate(
          `${this.path}.pickupPoints[${i}].longitude`,
          pickupPoint.longitude
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].googlePlaceId`,
          pickupPoint.googlePlaceId
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].street`,
          pickupPoint.street
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].postalCode`,
          pickupPoint.postalCode
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].locality`,
          pickupPoint.locality
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].region`,
          pickupPoint.region
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].state`,
          pickupPoint.state
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].country`,
          pickupPoint.country
        ),
      ])
      .flat(1)
      .filter(Boolean);
  };
}
