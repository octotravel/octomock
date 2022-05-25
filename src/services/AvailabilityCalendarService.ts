import { CapabilityId } from "@octocloud/types";
import { eachDayOfInterval } from "date-fns";
import { AvailabilityCalendarModel } from "./../models/AvailabilityCalendar";
import { AvailabilityModel } from "./../models/Availability";
// import { AvailabilityCalendar } from './../types/AvailabilityCalendar';
import { AvailabilityCalendarSchema } from "./../schemas/AvailabilityCalendar";
import { ProductService } from "./ProductService";
import { AvailabilityGenerator } from "../generators/AvailabilityGenerator";
import { DateHelper } from "../helpers/DateHelper";

interface IAvailabilityService {
  getAvailability(
    schema: AvailabilityCalendarSchema,
    capabilities: CapabilityId[]
  ): Promise<AvailabilityCalendarModel[]>;
}

export class AvailabilityCalendarService implements IAvailabilityService {
  private generator = new AvailabilityGenerator();
  private productService = new ProductService();

  public getAvailability = async (
    schema: AvailabilityCalendarSchema,
    capabilities: CapabilityId[]
  ): Promise<AvailabilityCalendarModel[]> => {
    const product = this.productService.getProduct(schema.productId);
    const optionId = schema.optionId;

    const availabilities = this.generator.generate({
      product,
      optionId,
      capabilities,
      date: DateHelper.availabilityDateFormat(new Date()),
      units: schema.units,
    });
    return this.mapToCalendar(
      this.getIntervalDate(
        schema.localDateStart,
        schema.localDateEnd,
        availabilities
      )
    );
  };

  private mapToCalendar = (
    availabilities: AvailabilityModel[]
  ): AvailabilityCalendarModel[] => {
    const groupedAvailabilities = availabilities.reduce(
      (acc: { [key: string]: AvailabilityModel[] }, availability) => {
        const [date, _] = availability.id.split("T");
        acc[date] = acc[date] ? [...acc[date], availability] : [availability];
        return acc;
      },
      {}
    );

    return Object.keys(groupedAvailabilities)
      .map((key) => {
        const max = groupedAvailabilities[key].reduce((prev, current) =>
          prev.vacancies > current.vacancies ? prev : current
        );
        return max;
      })
      .map(
        (model) =>
          new AvailabilityCalendarModel({
            localDate: model.id.split("T")[0],
            available: model.available,
            status: model.status,
            vacancies: model.vacancies,
            capacity: model.capacity,
            openingHours: model.openingHours,
            availabilityPricing: model.availabilityPricingModel,
          })
      );
  };

  private getIntervalDate = (
    start: string,
    end: string,
    availabilities: AvailabilityModel[]
  ): AvailabilityModel[] => {
    const interval = eachDayOfInterval({
      start: new Date(start),
      end: new Date(end),
    }).map(DateHelper.availabilityDateFormat);
    return availabilities.filter((a) => {
      return interval.includes(a.id.split("T")[0]);
    });
  };
}
