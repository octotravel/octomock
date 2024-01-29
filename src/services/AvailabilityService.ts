import { CapabilityId, AvailabilityBodySchema } from '@octocloud/types';
import { eachDayOfInterval, isMatch } from 'date-fns';
import { AvailabilityModel } from '@octocloud/generators';
import { InvalidAvailabilityIdError, BadRequestError } from '../models/Error';
import { DateHelper } from '../helpers/DateFormatter';
import { ProductRepository } from '../repositories/ProductRepository';
import { AvailabilityModelFactory } from '../factories/AvailabilityModelFactory';
import { ProductWithAvailabilityModel } from '../models/ProductWithAvailabilityModel';
import { OfferRepository } from '../repositories/OfferRepository';
import { OfferWithDiscountModel } from '../models/OfferWithDiscountModel';

interface FindBookingAvailabilityData {
  productWithAvailabilityModel: ProductWithAvailabilityModel;
  optionId: string;
  availabilityId: string;
}

interface IAvailabilityService {
  getAvailability: (schema: AvailabilityBodySchema, capabilities: CapabilityId[]) => Promise<AvailabilityModel[]>;
  findBookingAvailability: (
    data: FindBookingAvailabilityData,
    capabilities: CapabilityId[],
  ) => Promise<AvailabilityModel>;
}

export class AvailabilityService implements IAvailabilityService {
  private readonly productRepository = new ProductRepository();

  private readonly offerRepository = new OfferRepository();

  public getAvailability = async (
    schema: AvailabilityBodySchema,
    capabilities: CapabilityId[],
  ): Promise<AvailabilityModel[]> => {
    const productWithAvailabilityModel = this.productRepository.getProductWithAvailability(schema.productId);
    const offerWithDiscountModels = this.getOffers(schema.offerCode);
    const optionId = schema.optionId;

    const availabilities = AvailabilityModelFactory.createMultiple({
      productWithAvailabilityModel,
      offerWithDiscountModels,
      optionId,
      capabilities,
      date: DateHelper.availabilityDateFormat(new Date()),
      availabilityUnits: schema.units,
    });

    if (schema.localDate) {
      return this.getSingleDate(schema.localDate, availabilities);
    }
    if (schema.localDateStart && schema.localDateStart) {
      return this.getIntervalDate(schema.localDateStart, schema.localDateEnd!, availabilities);
    }
    if (schema.availabilityIds) {
      return this.getAvailabilityIDs(schema.availabilityIds, availabilities);
    }
    return [];
  };

  public findBookingAvailability = async (
    data: FindBookingAvailabilityData,
    capabilities: CapabilityId[],
  ): Promise<AvailabilityModel> => {
    const optionId = data.optionId;

    if (!isMatch(data.availabilityId, "yyyy-MM-dd'T'HH:mm:ssxxx")) {
      throw new InvalidAvailabilityIdError(data.availabilityId);
    }

    const date = new Date(data.availabilityId);
    const offerWithDiscountModels = this.offerRepository.getOffersWithDiscount();
    const availabilities = AvailabilityModelFactory.createMultiple({
      productWithAvailabilityModel: data.productWithAvailabilityModel,
      offerWithDiscountModels,
      optionId,
      capabilities,
      date: DateHelper.availabilityDateFormat(date),
    });
    const availability = availabilities.find((a) => a.id === data.availabilityId) ?? null;
    if (availability === null) {
      throw new InvalidAvailabilityIdError(data.availabilityId);
    }
    if (!availability.available) {
      throw new BadRequestError('not available');
    }
    return availability;
  };

  private readonly getAvailabilityIDs = (
    availabilityIds: string[],
    availabilities: AvailabilityModel[],
  ): AvailabilityModel[] => availabilities.filter((a) => availabilityIds.includes(a.id));

  private readonly getSingleDate = (date: string, availabilities: AvailabilityModel[]): AvailabilityModel[] =>
    availabilities.filter((a) => a.id.split('T')[0] === date);

  private readonly getIntervalDate = (
    start: string,
    end: string,
    availabilities: AvailabilityModel[],
  ): AvailabilityModel[] => {
    const interval = eachDayOfInterval({
      start: new Date(start),
      end: new Date(end),
    }).map(DateHelper.availabilityDateFormat);
    return availabilities.filter((a) => interval.includes(a.id.split('T')[0]));
  };

  private getOffers(offerCode?: string): OfferWithDiscountModel[] {
    if (offerCode) {
      return [this.offerRepository.getOfferWithDiscount(offerCode)];
    }

    return this.offerRepository.getOffersWithDiscount();
  }
}
