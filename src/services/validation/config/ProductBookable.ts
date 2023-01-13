import { BookingUnitItemSchema, Option, Product, UnitType } from "@octocloud/types";

const randomInteger = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

interface GetUnitItemsData {
  quantity: number;
}

interface GetAvailabilityIDData {
  omitID: string;
}

export class ProductBookable {
  public product: Product;
  private _availabilityIdAvailable: Nullable<string[]> = null;
  private _availabilityIdSoldOut: Nullable<string>;
  constructor({
    product,
    availabilityIdAvailable,
    availabilityIdSoldOut,
  }: {
    product: Product;
    availabilityIdAvailable: Nullable<string[]>;
    availabilityIdSoldOut: Nullable<string>;
  }) {
    this.product = product;
    this._availabilityIdAvailable = availabilityIdAvailable ?? null;
    this._availabilityIdSoldOut = availabilityIdSoldOut;
  }

  public get availabilityIdAvailable() {
    return this._availabilityIdAvailable;
  }

  public get randomAvailabilityID() {
    return this.pickRandomAvailabilityID(this._availabilityIdAvailable);
  }

  public get availabilityIdSoldOut() {
    return this._availabilityIdSoldOut;
  }

  public get isSoldOut() {
    return this._availabilityIdSoldOut !== null;
  }

  public get isAvailable() {
    return this._availabilityIdAvailable?.length > 0;
  }

  public get hasMultipleAvailabilities() {
    return this._availabilityIdAvailable?.length === 2;
  }

  public getAvialabilityID = (data: GetAvailabilityIDData): string => {
    return this.pickRandomAvailabilityID(
      this._availabilityIdAvailable.filter((id) => id !== data.omitID)
    );
  };

  private pickRandomAvailabilityID = (array: string[]): string => {
    return array[Math.floor(Math.random() * array.length)];
  };
  public getValidUnitItems = (data?: GetUnitItemsData): BookingUnitItemSchema[] => {
    const option = this.getOption();
    const unit = option.units.find((unit) => unit.type === UnitType.ADULT) ?? option.units[0];
    const unitId = unit.id;

    const quantity =
      data?.quantity ??
      randomInteger(option.restrictions.minUnits || 1, option.restrictions.maxUnits ?? 5);
    return Array(quantity).fill({ unitId });
  };

  public getInvalidUnitItems = (data?: GetUnitItemsData): BookingUnitItemSchema[] => {
    const quantity = data?.quantity ?? 1;
    const unitItems = Array.from({ length: quantity }, () => {
      return {
        unitId: "invalidUnitId",
      };
    });
    return unitItems;
  };

  public getOption = (): Option => {
    const option = this.product.options.find((option) => option.default) ?? this.product.options[0];

    return option;
  };
}
