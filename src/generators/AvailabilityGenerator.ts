import { CapabilityId, AvailabilityStatus } from "@octocloud/types";
import { AvailabilityUnit } from "./../schemas/Availability";
import { ProductModel } from "../models/Product";

import { AvailabilityModel } from "../models/Availability";
import { AvailabilityBuilder } from "../builders/AvailabilityBuilder";
import { addDays, eachDayOfInterval, getDay, getMonth } from "date-fns";
import { DateHelper } from "../helpers/DateHelper";

interface GenerateAvailabiltyData {
  product: ProductModel;
  optionId: string;
  date: string;
  units?: AvailabilityUnit[];
  capabilities: CapabilityId[];
}

export class AvailabilityGenerator {
  private builder = new AvailabilityBuilder();

  public generate = (data: GenerateAvailabiltyData): AvailabilityModel[] => {
    const { product, optionId, date, capabilities, units } = data;
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
          status: config.freesale
            ? AvailabilityStatus.FREESALE
            : AvailabilityStatus.AVAILABLE,
          units,
          capabilities,
          capacity: config.freesale ? null : config.capacity.get(getDay(day)),
        });
        return model;
      })
      .flat(1);

    return dates.filter(Boolean);
  };
}
