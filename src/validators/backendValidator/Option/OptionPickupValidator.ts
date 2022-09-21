import { PickupPoint, Option } from "@octocloud/types";
import {
  StringValidator,
  BooleanValidator,
  ModelValidator,
  ValidatorError,
  NumberValidator,
} from "../ValidatorHelpers";

export class OptionPickupValidator implements ModelValidator {
  private path: string;
  constructor({ path }: { path: string }) {
    this.path = path;
  }
  public validate = (option: Option): ValidatorError[] => {
    return [
      BooleanValidator.validate(
        `${this.path}.pickupAvailable`,
        option?.pickupAvailable
      ),
      BooleanValidator.validate(
        `${this.path}.pickupRequired`,
        option?.pickupRequired
      ),
      ...this.validatePickupPoints(
        option.pickupPoints ?? ([] as PickupPoint[])
      ),
    ].flatMap((v) => (v ? [v] : []));
  };

  private validatePickupPoints = (
    pickupPoints: PickupPoint[]
  ): ValidatorError[] => {
    return pickupPoints
      .map((pickupPoint, i) => [
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].id`,
          pickupPoint?.id
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].name`,
          pickupPoint?.name
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].directions`,
          pickupPoint?.directions,
          { nullable: true }
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].address`,
          pickupPoint?.address
        ),
        NumberValidator.validate(
          `${this.path}.pickupPoints[${i}].latitude`,
          pickupPoint?.latitude,
          { nullable: true }
        ),
        NumberValidator.validate(
          `${this.path}.pickupPoints[${i}].longitude`,
          pickupPoint?.longitude,
          { nullable: true }
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].googlePlaceId`,
          pickupPoint?.googlePlaceId,
          { nullable: true }
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].street`,
          pickupPoint?.street,
          { nullable: true }
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].postalCode`,
          pickupPoint?.postalCode,
          { nullable: true }
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].locality`,
          pickupPoint?.locality,
          { nullable: true }
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].region`,
          pickupPoint?.region,
          { nullable: true }
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].state`,
          pickupPoint?.state,
          { nullable: true }
        ),
        StringValidator.validate(
          `${this.path}.pickupPoints[${i}].country`,
          pickupPoint?.country,
          { nullable: true }
        ),
      ])
      .flat(1)
      .flatMap((v) => (v ? [v] : []));
  };
}
