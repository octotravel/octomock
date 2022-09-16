import {
  BookingUnitItemSchema,
  Option,
  Product,
  UnitType,
} from "@octocloud/types";
import { ValidatorError } from "../../../validators/backendValidator/ValidatorHelpers";

export interface ErrorResult<T> {
  data: Nullable<T>;
  error: Nullable<ValidatorError>;
}
interface IProductValidatorData {
  product: Product;
  getValidUnitItems(data?: Record<UnitType, number>): BookingUnitItemSchema[];
  getInvalidUnitItems({
    quantity,
  }: {
    quantity: number;
  }): BookingUnitItemSchema[];
  getOption(optionID?: string): Option;
  getAvailabilityIDAvailable(): [string, string];
  getAvailabilityIDSoldOut(): string;
}

const randomInteger = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export class ProductValidatorData implements IProductValidatorData {
  public product: Product;
  private availabilityIdAvailable: [string, string];
  private availabilityIdSoldOut: Nullable<string>;
  constructor({
    product,
    availabilityIdAvailable,
    availabilityIdSoldOut,
  }: {
    product: Product;
    availabilityIdAvailable: [string, string];
    availabilityIdSoldOut: Nullable<string>;
  }) {
    this.product = product;
    this.availabilityIdAvailable = availabilityIdAvailable;
    this.availabilityIdSoldOut = availabilityIdSoldOut;
  }
  public getValidUnitItems = (
    data?: Record<UnitType, number>
  ): BookingUnitItemSchema[] => {
    const option = this.getOption();
    if (data) {
      return Object.keys(data)
        .map((key) => {
          const unit = option.units.find((unit) => unit.type === key);
          if (unit) {
            return Array(data[key]).fill({ unitId: unit.id });
          }
        })
        .filter(Boolean)
        .flat(1);
    }
    const unit =
      option.units.find((unit) => unit.type === UnitType.ADULT) ??
      option.units[0];
    const unitId = unit.id;

    // if (unitId === null) {
    //   return {
    //     data: null,
    //     error: new ValidatorError({
    //       message: "unit does not exist",
    //       type: ErrorType.CRITICAL,
    //     }),
    //   };
    // }

    const quantity = randomInteger(
      option.restrictions.minUnits || 1,
      option.restrictions.maxUnits ?? 5
    );
    return Array(quantity).fill({ unitId });
  };

  public getInvalidUnitItems = ({
    quantity,
  }: {
    quantity: number;
  }): BookingUnitItemSchema[] => {
    const unitItems = Array.from({ length: quantity }, () => {
      return {
        unitId: "invalidUnitId",
      };
    });
    return unitItems;
  };

  public getOption = (optionID?: string): Option => {
    if (optionID) {
      const option = this.product.options.find(
        (option) => option.id === optionID
      );
      return option;
      // if (option === null) {
      //   return {
      //     data: null,
      //     error: new ValidatorError({
      //       message: "Option does not exist",
      //       type: ErrorType.CRITICAL,
      //     }),
      //   };
      // }
      // return {
      //   data: option,
      //   error: null,
      // };
    }
    const option =
      this.product.options.find((option) => option.default) ??
      this.product.options[0];
    // null;

    return option;
    // if (option === null) {
    //   return {
    //     data: null,
    //     error: new ValidatorError({
    //       message: "Option does not exist",
    //       type: ErrorType.CRITICAL,
    //     }),
    //   };
    // }
    // return {
    //   data: option,
    //   error: null,
    // };
  };

  public getAvailabilityIDAvailable = (): [string, string] => {
    return this.availabilityIdAvailable;
  };

  public getAvailabilityIDSoldOut = (): string => {
    return this.availabilityIdSoldOut;
  };
}
