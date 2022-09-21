import {
  PricingUnit,
  PricingPer,
  Pricing,
  AvailabilityType,
  OpeningHours,
} from "@octocloud/types";
import { PricingConfig } from "./../builders/ProductBuilder";
import { OptionConfigModel } from "./OptionConfig";
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

type Capacity = Map<Day, Nullable<number>>;

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

export class AvailabilityConfigModel {
  public days: number;
  public daysClosed: Day[];
  public daysSoldOut: Day[];
  public monthsClosed: Month[];
  public availabilityType: AvailabilityType;
  public openingHours: OpeningHours[];
  public capacity: Capacity;
  public freesale: boolean;
  private pricing: Map<string, Pricing>;
  private unitPricing: Map<string, PricingUnit[]>;

  constructor({
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
      R.isEmpty(openingHours.length)
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
  }

  public setPricing = (
    optionsConfig: OptionConfigModel[],
    pricingConfig: PricingConfig
  ): AvailabilityConfigModel => {
    const pricingMap = new Map<string, Pricing>();
    if (pricingConfig.pricingPer === PricingPer.BOOKING) {
      optionsConfig.forEach((config) => {
        pricingMap.set(config.id, config.pricingFrom[0]);
      });
    }
    this.pricing = pricingMap;

    const unitPricingMap = new Map<string, PricingUnit[]>();
    if (pricingConfig.pricingPer === PricingPer.UNIT) {
      optionsConfig.forEach((config) => {
        const unitPricing = config.unitConfigModels
          .map((unitConfig) => {
            return unitConfig.pricingFrom.map((pricing) => {
              return {
                ...pricing,
                unitId: unitConfig.id,
              };
            });
          })
          .flat(1);
        unitPricingMap.set(config.id, unitPricing);
      });
    }
    this.unitPricing = unitPricingMap;

    return this;
  };

  public getPricing = (optionId: string): Pricing => {
    return this.pricing.get(optionId);
  };

  public getUnitPricing = (optionId: string): PricingUnit[] => {
    return this.unitPricing.get(optionId);
  };
}
