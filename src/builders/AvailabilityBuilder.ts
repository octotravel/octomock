import { InvalidOptionIdError } from "./../models/Error";
import {
  addDays,
  addHours,
  addMinutes,
  addSeconds,
  startOfDay,
} from "date-fns";
import { CapabilityId } from "../types/Capability";
import { AvailabilityModel } from "../models/Availability";
import { ProductModel } from "../models/Product";
import { AvailabilityStatus } from "../types/Availability";
import { OptionModel } from "../models/Option";
import { DurationUnit } from "../types/Duration";
import { DateHelper } from "../helpers/DateHelper";
import { AvailabilityPricingModel } from "../models/AvailabilityPricing";

interface AvailabilityBuilderData {
  product: ProductModel;
  optionId: string;
  date: string;
  capabilities: CapabilityId[];
  status: AvailabilityStatus;
  unitsCount: Nullable<number>;
  capacity: number;
}

export class AvailabilityBuilder {
  build(data: AvailabilityBuilderData): AvailabilityModel[] {
    const { product, date, optionId, status, unitsCount, capacity } = data;

    const option = product.getOption(optionId);
    if (option === null) {
      throw new InvalidOptionIdError(optionId);
    }
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
          available: availabilityStatus === AvailabilityStatus.AVAILABLE,
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
          availabilityPricing: new AvailabilityPricingModel({
            unitPricing: product.availabilityConfig.getUnitPricing(optionId),
            pricing: product.availabilityConfig.getPricing(optionId),
          }),
        });

        return availability;
      }
    );
    return availabilities;
  }

  private getStatus = ({
    capacity,
    status,
    unitsCount,
  }: {
    capacity: number;
    status: AvailabilityStatus;
    unitsCount: Nullable<number>;
  }) => {
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
      if (option.optionContentModel.durationUnit === DurationUnit.HOURS) {
        return DateHelper.availabilityIdFormat(
          addHours(date, Number(option.optionContentModel.durationAmount)),
          timeZone
        );
      }
      if (option.optionContentModel.durationUnit === DurationUnit.MINUTES) {
        return DateHelper.availabilityIdFormat(
          addMinutes(date, Number(option.optionContentModel.durationAmount)),
          timeZone
        );
      }
      if (option.optionContentModel.durationUnit === DurationUnit.SECONDS) {
        return DateHelper.availabilityIdFormat(
          addSeconds(date, Number(option.optionContentModel.durationAmount)),
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
