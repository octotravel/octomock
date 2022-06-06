import {
  Pricing,
  CapabilityId,
  AvailabilityStatus,
  DurationUnit,
  PricingPer,
  PricingUnit,
} from "@octocloud/types";
import * as R from "ramda";
import { AvailabilityUnit } from "./../schemas/Availability";
import { InvalidOptionIdError, InvalidUnitIdError } from "./../models/Error";
import { addDays, addHours, addMinutes, startOfDay } from "date-fns";
import { AvailabilityModel } from "../models/Availability";
import { ProductModel } from "../models/Product";
import { OptionModel } from "../models/Option";
import { DateHelper } from "../helpers/DateHelper";
import { AvailabilityPricingModel } from "../models/AvailabilityPricing";

interface AvailabilityBuilderData {
  product: ProductModel;
  optionId: string;
  date: string;
  capabilities: CapabilityId[];
  status: AvailabilityStatus;
  units: AvailabilityUnit[];
  capacity: number;
}

const defaultPricing = {
  original: 0,
  retail: 0,
  net: 0,
  currency: "",
  currencyPrecision: 0,
  includedTaxes: [],
};

export class AvailabilityBuilder {
  build(data: AvailabilityBuilderData): AvailabilityModel[] {
    const { product, date, optionId, status, units, capacity } = data;

    const option = product.getOption(optionId);
    if (option === null) {
      throw new InvalidOptionIdError(optionId);
    }
    const unitsCount = units
      ? units.reduce((acc, unit) => {
          return acc + unit.quantity;
        }, 0)
      : null;

    const availabilities = option.availabilityLocalStartTimes.map(
      (startTime) => {
        const datetime = new Date(`${date}T${startTime}`);
        const localDateTimeStart = DateHelper.availabilityIdFormat(
          datetime,
          product.timeZone
        );

        const localDateTimeEnd = this.calculateTimeEnd(
          datetime,
          option,
          product.timeZone
        );

        const availabilityStatus = this.getStatus({
          status,
          unitsCount,
          capacity,
        });

        const availability = new AvailabilityModel({
          id: localDateTimeStart,
          localDateTimeStart,
          localDateTimeEnd,
          allDay: option.availabilityLocalStartTimes.length === 1,
          available: availabilityStatus !== AvailabilityStatus.SOLD_OUT,
          status: availabilityStatus,
          vacancies:
            availabilityStatus === AvailabilityStatus.SOLD_OUT ? 0 : capacity,
          capacity:
            availabilityStatus === AvailabilityStatus.SOLD_OUT ? 0 : capacity,
          maxUnits:
            availabilityStatus === AvailabilityStatus.SOLD_OUT
              ? 0
              : option.restrictions.maxUnits,
          utcCutoffAt: DateHelper.utcDateFormat(datetime),
          openingHours: product.availabilityConfig.openingHours,
          availabilityPricing: this.getPricing(data),
        });

        return availability;
      }
    );
    return availabilities;
  }

  private getPricing = (
    data: AvailabilityBuilderData
  ): AvailabilityPricingModel => {
    const pricingPer = data.product.productPricingModel.pricingPer;
    if (data.units && pricingPer === PricingPer.UNIT) {
      const unitPricing = data.product.availabilityConfig.getUnitPricing(
        data.optionId
      );
      const pricing = data.units
        .map(({ id, quantity }) => {
          const uPricing: PricingUnit =
            unitPricing.find((p) => p.unitId === id) ?? null;
          if (uPricing === null) {
            throw new InvalidUnitIdError(id);
          }
          const pricing: Pricing = R.omit(["unitId"], uPricing);
          return new Array(quantity).fill(pricing);
        })
        .flat(1)
        .reduce(
          (acc, unitPricing) => ({
            original: acc.original + unitPricing.original,
            retail: acc.retail + unitPricing.retail,
            net: acc.net + unitPricing.net,
            currency: unitPricing.currency,
            currencyPrecision: unitPricing.currencyPrecision,
            includedTaxes: [...acc.includedTaxes, ...unitPricing.includedTaxes],
          }),
          defaultPricing
        );
      return new AvailabilityPricingModel({
        unitPricing,
        pricing,
        pricingPer,
        containsUnits: true,
      });
    }
    return new AvailabilityPricingModel({
      unitPricing: data.product.availabilityConfig.getUnitPricing(
        data.optionId
      ),
      pricing: data.product.availabilityConfig.getPricing(data.optionId),
      pricingPer,
    });
  };

  private getStatus = ({
    capacity,
    status,
    unitsCount,
  }: {
    capacity: number;
    status: AvailabilityStatus;
    unitsCount: Nullable<number>;
  }) => {
    if (capacity === null) {
      return status;
    }
    if (unitsCount) {
      return capacity < unitsCount ? AvailabilityStatus.SOLD_OUT : status;
    }

    if (capacity === 0) {
      return AvailabilityStatus.SOLD_OUT;
    }

    return status;
  };

  private calculateTimeEnd = (
    date: Date,
    option: OptionModel,
    timeZone: string
  ) => {
    if (option.optionContentModel.durationAmount !== "0") {
      if (option.optionContentModel.durationUnit === DurationUnit.HOUR) {
        return DateHelper.availabilityIdFormat(
          addHours(date, Number(option.optionContentModel.durationAmount)),
          timeZone
        );
      }
      if (option.optionContentModel.durationUnit === DurationUnit.MINUTE) {
        return DateHelper.availabilityIdFormat(
          addMinutes(date, Number(option.optionContentModel.durationAmount)),
          timeZone
        );
      }
      if (option.optionContentModel.durationUnit === DurationUnit.DAY) {
        return DateHelper.availabilityIdFormat(
          addDays(date, Number(option.optionContentModel.durationAmount)),
          timeZone
        );
      }
    }
    return DateHelper.availabilityIdFormat(
      startOfDay(addDays(date, 1)),
      timeZone
    );
  };
}
