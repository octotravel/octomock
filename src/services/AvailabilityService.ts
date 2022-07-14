import { CapabilityId, AvailabilityBodySchema } from "@octocloud/types";
import { InvalidAvailabilityIdError, BadRequestError } from "./../models/Error";
import { ProductModel } from "./../models/Product";
import { ProductService } from "./ProductService";
import { AvailabilityGenerator } from "../generators/AvailabilityGenerator";
import { eachDayOfInterval } from "date-fns";
import { AvailabilityModel } from "../models/Availability";
import { DateHelper } from "../helpers/DateHelper";

interface FindBookingAvailabilityData {
  product: ProductModel;
  optionId: string;
  availabilityId: string;
}

interface IAvailabilityService {
  getAvailability(
    schema: AvailabilityBodySchema,
    capabilities: CapabilityId[]
  ): Promise<AvailabilityModel[]>;
  findBookingAvailability(
    data: FindBookingAvailabilityData,
    capabilities: CapabilityId[]
  ): Promise<AvailabilityModel>;
}

export class AvailabilityService implements IAvailabilityService {
  private generator = new AvailabilityGenerator();
  private productService = new ProductService();

  public getAvailability = async (
    schema: AvailabilityBodySchema,
    capabilities: CapabilityId[]
  ): Promise<AvailabilityModel[]> => {
    const product = this.productService.getProduct(schema.productId);
    const optionId = schema.optionId;

    const availabilities = this.generator.generate({
      product,
      optionId,
      capabilities,
      date: DateHelper.availabilityDateFormat(new Date()),
      units: schema.units,
    });

    if (schema.localDate) {
      return this.getSingleDate(schema.localDate, availabilities);
    }
    if (schema.localDateStart && schema.localDateStart) {
      return this.getIntervalDate(
        schema.localDateStart,
        schema.localDateEnd,
        availabilities
      );
    }
    return [];
  };

  public findBookingAvailability = async (
    data: FindBookingAvailabilityData,
    capabilities: CapabilityId[]
  ): Promise<AvailabilityModel> => {
    const optionId = data.optionId;

    const date = new Date(data.availabilityId);
    if (!date.getTime()) {
      throw new InvalidAvailabilityIdError(data.availabilityId);
    }

    const availabilities = this.generator.generate({
      product: data.product,
      optionId,
      capabilities,
      date: DateHelper.availabilityDateFormat(date),
    });
    const availability =
      availabilities.find(
        (availability) => availability.id === data.availabilityId
      ) ?? null;
    if (availability === null) {
      throw new InvalidAvailabilityIdError(data.availabilityId);
    }
    if (!availability.available) {
      throw new BadRequestError("not available");
    }
    return availability;
  };

  private getSingleDate = (
    date: string,
    availabilities: AvailabilityModel[]
  ): AvailabilityModel[] => {
    return availabilities.filter((a) => {
      return a.id.split("T")[0] === date;
    });
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
