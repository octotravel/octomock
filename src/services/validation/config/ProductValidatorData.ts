import {
  BookingUnitItemSchema,
  Option,
  Product,
  UnitType,
} from "@octocloud/types";

interface IProductValidatorData {
  product: Product;
  getValidUnitItems(data?: Record<UnitType, number>): BookingUnitItemSchema[];
  getInvalidUnitItems({
    quantity,
  }: {
    quantity: number;
  }): BookingUnitItemSchema[];
  getOption(optionID?: string): Option;
  getAvailabilityIDAvailable(): string[];
  getAvailabilityIDSoldOut(): string;
}

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
    const unit = option.units.find((unit) => unit.type === UnitType.ADULT);
    if (unit) {
      const ran = Math.floor(
        Math.random() *
          ((option.restrictions.maxUnits ?? 5) -
            (option.restrictions.minUnits ?? 1) +
            1) +
          (option.restrictions.minUnits ?? 1)
      );
      console.log(ran);
      return Array(ran).fill({ unitId: unit.id });
    }
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
      return this.product.options.find((option) => option.id === optionID);
    }
    return (
      this.product.options.find((option) => option.default) ??
      this.product.options[0]
    );
  };

  public getAvailabilityIDAvailable = (): string[] => {
    return this.availabilityIdAvailable;
  };

  public getAvailabilityIDSoldOut = (): string => {
    return this.availabilityIdSoldOut;
  };
}
