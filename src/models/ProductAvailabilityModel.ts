import { ProductModel } from "@octocloud/generators";
import {
  PricingUnit,
  PricingPer,
  Pricing,
  AvailabilityType,
  OpeningHours,
} from "@octocloud/types";

import * as R from "ramda";

export enum Day {
  Mon = 1,
  Tue = 2,
  Wed = 3,
  Thu = 4,
  Fri = 5,
  Sat = 6,
  Sun = 0,
}

export enum Month {
  Jan = 0,
  Feb = 1,
  Mar = 2,
  Apr = 3,
  May = 4,
  Jun = 5,
  Jul = 6,
  Aug = 7,
  Sep = 8,
  Oct = 9,
  Nov = 10,
  Dec = 11,
}

export type Capacity = Map<Day, Nullable<number>>;

const fillCapacity = (value: Nullable<number>): Capacity => {
  return new Map([
    [Day.Mon, value],
    [Day.Tue, value],
    [Day.Wed, value],
    [Day.Thu, value],
    [Day.Fri, value],
    [Day.Sat, value],
    [Day.Sun, value],
  ]);
};

export class ProductAvailabilityModel {
  public days: number;
  public daysClosed: Day[];
  public daysSoldOut: Day[];
  public monthsClosed: Month[];
  public availabilityType: AvailabilityType;
  public openingHours: OpeningHours[];
  public capacity: Capacity;
  public freesale: boolean;
  private pricing!: Map<string, Pricing>;
  private unitPricing!: Map<string, PricingUnit[]>;

  constructor({
    productModel,
    days,
    daysClosed,
    daysSoldOut,
    monthsClosed,
    availabilityType,
    openingHours,
    capacity,
    capacityValue,
    freesale,
  }: {
    productModel: ProductModel;
    days?: number;
    daysClosed?: Day[];
    daysSoldOut?: Day[];
    monthsClosed?: Month[];
    availabilityType?: AvailabilityType;
    openingHours?: OpeningHours[];
    capacity?: Capacity;
    capacityValue?: number;
    freesale?: boolean;
  }) {
    if (
      availabilityType === AvailabilityType.OPENING_HOURS &&
      (openingHours === undefined || R.isEmpty(openingHours.length))
    ) {
      throw new Error(
        "openingHours cannot be empty when AvailabilityType = OPENING_HOURS"
      );
    }

    if (capacity) {
      this.capacity = new Map([
        ...Array.from(fillCapacity(capacityValue ?? 0).entries()),
        ...Array.from(capacity.entries()),
      ]);
    } else {
      this.capacity = fillCapacity(capacityValue ?? null);
    }

    this.days = days ?? 365;
    this.daysClosed = daysClosed ?? [];
    this.daysSoldOut = daysSoldOut ?? [];
    this.monthsClosed = monthsClosed ?? [];
    this.availabilityType = availabilityType ?? AvailabilityType.START_TIME;
    this.openingHours = openingHours ?? [];
    this.freesale = freesale ?? false;
    this.setPricing(productModel);
  }

  public setPricing(productModel: ProductModel): void {
    const pricingMap = new Map<string, Pricing>();

    if (productModel.productPricingModel?.pricingPer === PricingPer.BOOKING) {
      productModel.optionModels.forEach((optionModel) => {
        const optionPricingModel = optionModel.getOptionPricingModel();

        if (
          optionPricingModel.pricingFrom !== undefined &&
          optionPricingModel.pricingFrom.length > 0
        ) {
          pricingMap.set(optionModel.id, optionPricingModel.pricingFrom[0]);
        }
      });
    }

    this.pricing = pricingMap;

    const unitPricingMap = new Map<string, PricingUnit[]>();

    if (productModel.productPricingModel?.pricingPer === PricingPer.UNIT) {
      productModel.optionModels.forEach((optionModel) => {
        const unitPricing = optionModel.unitModels
          .map((unitModel) => {
            const unitPricingModel = unitModel.getUnitPricingModel();

            if (unitPricingModel.pricingFrom === undefined) {
              return;
            }

            return unitPricingModel.pricingFrom.map((pricingFrom) => {
              return {
                unitId: unitModel.id,
                ...pricingFrom,
              } as PricingUnit;
            });
          })
          .flat(1) as PricingUnit[];

        unitPricingMap.set(productModel.id, unitPricing);
      });
    }
    this.unitPricing = unitPricingMap;
  }

  public getPricing = (optionId: string): Pricing => {
    return this.pricing.get(optionId)!;
  };

  public getUnitPricing = (optionId: string): PricingUnit[] => {
    return this.unitPricing.get(optionId)!;
  };
}
