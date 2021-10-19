import { ProductRepository } from "../repositories/ProductRepository";
import { CapabilityId } from "../types/Capability";
import { Availability } from "../types/Availability";
import { AvailabilityGenerator } from "../generators/AvailabilityGenerator";
import { eachDayOfInterval, format } from "date-fns";
import { AvailabilityModel } from "../models/Availability";
import { AvailabilitySchema } from "../schemas/Availability";

interface IAvailabilityController {
  getAvailability(schema: AvailabilitySchema, capabilities: CapabilityId[]): Promise<Availability[]>;
}

export class AvailabilityController implements IAvailabilityController {
  private productRepository = new ProductRepository();
  private generator = new AvailabilityGenerator();
  public getAvailability = async (
    schema: AvailabilitySchema,
    capabilities: CapabilityId[]
  ): Promise<Availability[]> => {
    const product = this.productRepository.getProduct(schema.productId, capabilities);
    const optionId = schema.optionId;

    const availabilities = this.generator.generate({
      product,
      optionId,
      capabilities,
      date: format(new Date(), "yyyy-MM-dd"),
    });


    if (schema.localDate) {
      return this.getSingleDate(schema.localDate, availabilities).map((a) => a.toPOJO());
    }
    if (schema.localDateStart && schema.localDateStart) {
      return this.getIntervalDate(schema.localDateStart, schema.localDateEnd, availabilities).map((a) => a.toPOJO());
    }
    return []
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
    const interval = eachDayOfInterval({start: new Date(start), end: new Date(end)}).map(d => format(d, "yyyy-MM-dd"))
    return availabilities.filter((a) => {
      return interval.includes(a.id.split("T")[0]);
    });
  };
}
