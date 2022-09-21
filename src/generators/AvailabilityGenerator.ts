import { AvailabilityConfigModel } from "./../models/AvailabilityConfig";
import {
  CapabilityId,
  AvailabilityStatus,
  AvailabilityUnit,
} from "@octocloud/types";
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
          status: this.getStatus(config, day),
          units,
          capabilities,
          capacity: config.freesale ? null : config.capacity.get(getDay(day)),
        });
        return model;
      })
      .flat(1);

    return dates.flatMap((v) => (v ? [v] : []));
  };

  private getStatus = (config: AvailabilityConfigModel, day: Date) => {
    const isSoldOut =
      config.daysSoldOut.includes(getDay(day)) ||
      config.daysSoldOut.includes(getMonth(day));
    if (isSoldOut) {
      return AvailabilityStatus.SOLD_OUT;
    }

    return config.freesale
      ? AvailabilityStatus.FREESALE
      : AvailabilityStatus.AVAILABLE;
  };
}
