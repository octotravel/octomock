import {
  BookingUnitItemSchema,
  Option,
  Product,
  UnitType,
} from "@octocloud/types";

interface IProductValidatorData {
  product: Product;
  getValidUnitItems(data?: Record<UnitType, number>): BookingUnitItemSchema[];
  getInvalidUnitItems(): BookingUnitItemSchema[];
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
  } // try to contruct unitItems from provided input, if not provided, try to find
  // ADULT on option, obey restrictions that are on option (min, max etc...)
  public getValidUnitItems = (
    data?: Record<UnitType, number>
  ): BookingUnitItemSchema[] => {
    const option = this.getOption();
    if (data) {
      const unitId = option.units.find(
        (unit) => unit.type === Object.keys(data)[0]
      ).id;
      const unitItems = Array.from({ length: Object.values(data)[0] }, () => {
        return {
          unitId: unitId,
        };
      });
      return unitItems;
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

  public getInvalidUnitItems = (): BookingUnitItemSchema[] => {
    return [
      {
        unitId: "invalidUnitId",
      },
      {
        unitId: "invalidUnitId",
      },
      {
        unitId: "invalidUnitId",
      },
    ];
  };

  public getOption = (optionID?: string): Option => {
    if (optionID) {
      return this.product.options.find((option) => option.id === optionID);
    }
    return this.product.options.find((option) => option.default);
  };

  public getAvailabilityIDAvailable = (): string[] => {
    return this.availabilityIdAvailable;
  };

  public getAvailabilityIDSoldOut = (): string => {
    return this.availabilityIdSoldOut;
  };
}
