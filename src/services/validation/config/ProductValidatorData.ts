import {
  BookingUnitItemSchema,
  Option,
  Product,
  UnitType,
} from "@octocloud/types";
import {
  ErrorType,
  ValidatorError,
} from "../../../validators/backendValidator/ValidatorHelpers";

export interface ErrorResult<T> {
  data: Nullable<T>;
  error: Nullable<ValidatorError>;
}
interface IProductValidatorData {
  product: Product;
  getValidUnitItems(
    data?: Record<UnitType, number>
  ): ErrorResult<BookingUnitItemSchema[]>;
  getInvalidUnitItems({
    quantity,
  }: {
    quantity: number;
  }): BookingUnitItemSchema[];
  getOption(optionID?: string): ErrorResult<Option>;
  getAvailabilityIDAvailable(): string[];
  getAvailabilityIDSoldOut(): string;
}

const randomInteger = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export class ProductValidatorData implements IProductValidatorData {
  public product: Product;
  private availabilityIdAvailable: string[];
  private availabilityIdSoldOut: Nullable<string>;
  constructor({
    product,
    availabilityIdAvailable,
    availabilityIdSoldOut,
  }: {
    product: Product;
    availabilityIdAvailable: string[];
    availabilityIdSoldOut: Nullable<string>;
  }) {
    this.product = product;
    this.availabilityIdAvailable = availabilityIdAvailable;
    this.availabilityIdSoldOut = availabilityIdSoldOut;
  }
  public getValidUnitItems = (
    data?: Record<UnitType, number>
  ): ErrorResult<BookingUnitItemSchema[]> => {
    const option = this.getOption();
    if (data) {
      return {
        data: Object.keys(data)
          .map((key) => {
            const unit = option.data.units.find((unit) => unit.type === key);
            if (unit) {
              return Array(data[key]).fill({ unitId: unit.id });
            }
          })
          .filter(Boolean)
          .flat(1),
        error: null,
      };
    }
    const unitId =
      option.data.units.find((unit) => unit.type === UnitType.ADULT).id ??
      option.data.units[0].id ??
      null;

    if (unitId === null) {
      return {
        data: null,
        error: new ValidatorError({
          message: "unit does not exist",
          type: ErrorType.CRITICAL,
        }),
      };
    }

    const quantity = randomInteger(
      option.data.restrictions.minUnits || 1,
      option.data.restrictions.maxUnits ?? 5
    );
    return {
      data: Array(quantity).fill({ unitId }),
      error: null,
    };
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

  public getOption = (optionID?: string): ErrorResult<Option> => {
    if (optionID) {
      const option = this.product.options.find(
        (option) => option.id === optionID
      );
      if (option === null) {
        return {
          data: null,
          error: new ValidatorError({
            message: "Option does not exist",
            type: ErrorType.CRITICAL,
          }),
        };
      }
      return {
        data: option,
        error: null,
      };
    }
    const option =
      this.product.options.find((option) => option.default) ??
      this.product.options[0] ??
      null;
    if (option === null) {
      return {
        data: null,
        error: new ValidatorError({
          message: "Option does not exist",
          type: ErrorType.CRITICAL,
        }),
      };
    }
    return {
      data: option,
      error: null,
    };
  };

  public getAvailabilityIDAvailable = (): string[] => {
    return this.availabilityIdAvailable;
  };

  public getAvailabilityIDSoldOut = (): string => {
    return this.availabilityIdSoldOut;
  };
}
