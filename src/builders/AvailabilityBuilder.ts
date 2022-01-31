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
}

export class AvailabilityBuilder {
  build(data: AvailabilityBuilderData): AvailabilityModel[] {
    const { product, date, optionId, status } = data;

    const option = product.getOption(optionId);
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

        const availability = new AvailabilityModel({
          id: localDateTimeStart,
          localDateTimeStart,
          localDateTimeEnd,
          allDay: option.availabilityLocalStartTimes.length === 1,
          available: status === AvailabilityStatus.AVAILABLE,
          status: status,
          vacancies: product.availabilityConfig.capacity,
          capacity: product.availabilityConfig.capacity,
          maxUnits: option.restrictions.maxUnits,
          utcCutoffAt: datetime.toISOString(),
          openingHours: product.availabilityConfig.openingHours,
          availabilityPricing: new AvailabilityPricingModel({
            unitPricing: product.availabilityConfig.getUnitPricing(optionId),
            pricing: product.availabilityConfig.getPricing(optionId)
          })
        });

        return availability;
      }
    );
    return availabilities;
  }

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
