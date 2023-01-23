import { CapabilityId, AvailabilityBodySchema } from "@octocloud/types";
import { InvalidAvailabilityIdError, BadRequestError } from "../models/Error";
import { eachDayOfInterval, isMatch } from "date-fns";
import { DateHelper } from "../helpers/DateHelper";
import { AvailabilityModel } from "@octocloud/generators";
import { ProductRepository } from "../repositories/ProductRepository";
import { AvailabilityModelFactory } from "../factories/AvailabilityModelFactory";
import { ProductWithAvailabilityModel } from "../models/ProductWithAvailabilityModel";

interface FindBookingAvailabilityData {
  productWithAvailabilityModel: ProductWithAvailabilityModel;
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
  private productRepository = new ProductRepository();

  public getAvailability = async (
    schema: AvailabilityBodySchema,
    capabilities: CapabilityId[]
  ): Promise<AvailabilityModel[]> => {
    const productWithAvailabilityModel =
      this.productRepository.getProductWithAvailability(schema.productId);
    const optionId = schema.optionId;

    const availabilities = AvailabilityModelFactory.createMultiple({
      productWithAvailabilityModel: productWithAvailabilityModel,
      optionId: optionId,
      capabilities: capabilities,
      date: DateHelper.availabilityDateFormat(new Date()),
      availabilityUnits: schema.units,
    });

    if (schema.localDate) {
      return this.getSingleDate(schema.localDate, availabilities);
    }
    if (schema.localDateStart && schema.localDateStart) {
      return this.getIntervalDate(
        schema.localDateStart,
        schema.localDateEnd!,
        availabilities
      );
    }
    if (schema.availabilityIds) {
      return this.getAvailabilityIDs(schema.availabilityIds, availabilities);
    }
    return [];
  };

  public findBookingAvailability = async (
    data: FindBookingAvailabilityData,
    capabilities: CapabilityId[]
  ): Promise<AvailabilityModel> => {
    const optionId = data.optionId;

    if (!isMatch(data.availabilityId, "yyyy-MM-dd'T'HH:mm:ssxxx")) {
      throw new InvalidAvailabilityIdError(data.availabilityId);
    }

    const date = new Date(data.availabilityId);
    const availabilities = AvailabilityModelFactory.createMultiple({
      productWithAvailabilityModel: data.productWithAvailabilityModel,
      optionId: optionId,
      capabilities: capabilities,
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

  private getAvailabilityIDs = (
    availabilityIds: string[],
    availabilities: AvailabilityModel[]
  ) => {
    return availabilities.filter((a) => availabilityIds.includes(a.id));
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
