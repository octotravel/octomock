import { CapabilityId } from "../types/Capability";
import { AvailabilityModel } from "../models/Availability";
import { ProductModel } from "../models/Product";
import { AvailabilityStatus } from "../types/Availability";
import format from "date-fns-tz/format";
import { addDays, addHours, addMinutes, addSeconds, startOfDay } from "date-fns";
import { OptionModel } from "../models/Option";
import { DurationUnit } from "../types/Duration";

interface AvailabilityBuilderData {
  product: ProductModel;
  optionId: string;
  date: string;
  capabilities: CapabilityId[];
  status: AvailabilityStatus;
}

export class AvailabilityBuilder {
  build(data: AvailabilityBuilderData): AvailabilityModel[] {
    const { product, date, optionId, capabilities, status } = data;

    const option = product.getOption(optionId);
    const availabilities = option.availabilityLocalStartTimes.map(
      (startTime) => {
        const datetime = new Date(`${date}T${startTime}`);

        const localDateTimeStart = format(
          datetime,
          "yyyy-MM-dd'T'HH:mm:ssxxx",
          {
            timeZone: product.timeZone,
          }
        );

        const localDateTimeEnd = this.calculateTimeEnd(
          datetime,
          option,
          product.timeZone
        );
        let availability = new AvailabilityModel({
          id: localDateTimeStart,
          localDateTimeStart,
          localDateTimeEnd,
          allDay: option.availabilityLocalStartTimes.length === 1,
          available: status === AvailabilityStatus.AVAILABLE,
          status: status,
          vacancies: null,
          capacity: null,
          maxUnits: option.restrictions.maxUnits,
          utcCutoffAt: datetime.toISOString(),
          openingHours: product.openingHours,
        });

        if (capabilities.includes(CapabilityId.Content)) {
          availability = availability.addContent();
        }

        if (capabilities.includes(CapabilityId.Pricing)) {
          availability = availability.addPricing();
        }

        if (capabilities.includes(CapabilityId.Pickups)) {
          availability = availability.addPickup();
        }
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
    if (option.durationAmount !== "0") {
      if (option.durationUnit === DurationUnit.HOURS) {
        return format(
          addHours(date, Number(option.durationAmount)),
          "yyyy-MM-dd'T'HH:mm:ssxxx",
          {
            timeZone,
          }
        );
      }
      if (option.durationUnit === DurationUnit.MINUTES) {
        return format(
          addMinutes(date, Number(option.durationAmount)),
          "yyyy-MM-dd'T'HH:mm:ssxxx",
          {
            timeZone,
          }
        );
      }
      if (option.durationUnit === DurationUnit.SECONDS) {
        return format(
          addSeconds(date, Number(option.durationAmount)),
          "yyyy-MM-dd'T'HH:mm:ssxxx",
          {
            timeZone,
          }
        );
      }
    }
    return format(startOfDay(addDays(date, 1)), "yyyy-MM-dd'T'HH:mm:ssxxx", {
      timeZone,
    });
  };
}
