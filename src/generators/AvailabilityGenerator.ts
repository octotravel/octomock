import { ProductModel } from "../models/Product";
import { CapabilityId } from "../types/Capability";

import { AvailabilityModel } from "../models/Availability";
import { AvailabilityBuilder } from "../builders/AvailabilityBuilder";
import { addDays, eachDayOfInterval, getDay } from "date-fns";
import { AvailabilityStatus } from "../types/Availability";
import { DateHelper } from "../helpers/DateHelper";

interface GenerateAvailabiltyData {
  product: ProductModel;
  optionId: string;
  date: string;
  capabilities: CapabilityId[];
}

export class AvailabilityGenerator {
  private builder = new AvailabilityBuilder();

  public generate = (data: GenerateAvailabiltyData): AvailabilityModel[] => {
    const { product, optionId, date, capabilities } = data;
    const config = product.availabilityConfig;

    const days = eachDayOfInterval({
      start: new Date(date),
      end: addDays(new Date(date), config.days),
    });

    return days
      .map((day) => {
        const isSoldOut = config.daysClosed.includes(getDay(day));
        return this.builder.build({
          product,
          optionId,
          date: DateHelper.availabilityDateFormat(day),
          status: isSoldOut
            ? AvailabilityStatus.SOLD_OUT
            : AvailabilityStatus.AVAILABLE,
          capabilities,
        });
      })
      .flat(1);
  };
}
