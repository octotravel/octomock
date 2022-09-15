import {
  BookingUnitItemSchema,
  Option,
  Product,
  UnitType,
} from "@octocloud/types";

interface IProductValidatorData {
  product: Product;
  getValidUnitItems(data?: Record<UnitType, number>): BookingUnitItemSchema[];
  getInvalidUnitItems(quantity: number): BookingUnitItemSchema[];
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
          const unitId = option.units.find((unit) => unit.type === key).id;
          return Array.from({ length: data[key] }, () => {
            return {
              unitId: unitId,
            };
          });
        })
        .flat(1);
    }
    const unitId =
      option.units.find((unit) => unit.type === UnitType.ADULT).id ??
      option.units[0].id;
    const unitItems = Array.from(
      { length: option.restrictions.maxUnits - option.restrictions.minUnits },
      () => {
        return {
          unitId: unitId,
        };
      }
    );
    return unitItems;
  };

  public getInvalidUnitItems = (quantity: number): BookingUnitItemSchema[] => {
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
