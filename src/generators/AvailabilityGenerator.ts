import { ProductModel } from "../models/Product";
import { CapabilityId } from "../types/Capability";

import { AvailabilityModel } from "../models/Availability";
import { AvailabilityBuilder } from "../builders/AvailabilityBuilder";
import { addDays, eachDayOfInterval, getDay, getMonth } from "date-fns";
import { AvailabilityStatus } from "../types/Availability";
import { DateHelper } from "../helpers/DateHelper";

interface GenerateAvailabiltyData {
  product: ProductModel;
  optionId: string;
  date: string;
  unitsCount: Nullable<number>;
  capabilities: CapabilityId[];
}

export class AvailabilityGenerator {
  private builder = new AvailabilityBuilder();

  public generate = (data: GenerateAvailabiltyData): AvailabilityModel[] => {
    const { product, optionId, date, capabilities, unitsCount } = data;
    const config = product.availabilityConfig;
    const days = eachDayOfInterval({
      start: new Date(date),
      end: addDays(new Date(date), config.days),
    });
    const dates = days
      .map((day) => {
        const isClosed =
          config.daysClosed.includes(getDay(day)) ||
          config.monthsClosed.includes(getMonth(day));

        if (isClosed) {
          return null;
        }

        const model = this.builder.build({
          product,
          optionId,
          date: DateHelper.availabilityDateFormat(day),
          status: isClosed
            ? AvailabilityStatus.SOLD_OUT
            : AvailabilityStatus.AVAILABLE,
          unitsCount,
          capabilities,
        });
        return model;
      })
      .flat(1);

    return dates.filter(Boolean);
  };
}
