import { CapabilityId, AvailabilityCalendarBodySchema } from '@octocloud/types';
import { eachDayOfInterval } from 'date-fns';
import { AvailabilityCalendarModel, AvailabilityModel } from '@octocloud/generators';
import { AvailabilityCalendarPricingModel } from '@octocloud/generators/dist/models/availability/AvailabilityCalendarPricingModel';
import { DateHelper } from '../helpers/DateFormatter';
import { ProductRepository } from '../repositories/ProductRepository';
import { AvailabilityModelFactory } from '../factories/AvailabilityModelFactory';
import { OfferRepository } from '../repositories/OfferRepository';

interface IAvailabilityService {
  getAvailability: (
    schema: AvailabilityCalendarBodySchema,
    capabilities: CapabilityId[],
  ) => Promise<AvailabilityCalendarModel[]>;
}

export class AvailabilityCalendarService implements IAvailabilityService {
  private readonly productRepository = new ProductRepository();

  private readonly offerRepository = new OfferRepository();

  public getAvailability = async (
    schema: AvailabilityCalendarBodySchema,
    capabilities: CapabilityId[],
  ): Promise<AvailabilityCalendarModel[]> => {
    const productWithAvailabilityModel = this.productRepository.getProductWithAvailability(schema.productId);
    const offerWithDiscountModels = this.offerRepository.getOffersWithDiscount();
    const optionId = schema.optionId;

    const availabilities = AvailabilityModelFactory.createMultiple({
      productWithAvailabilityModel,
      offerWithDiscountModels,
      optionId,
      capabilities,
      date: DateHelper.availabilityDateFormat(new Date()),
      availabilityUnits: schema.units,
    });
    return this.mapToCalendar(this.getIntervalDate(schema.localDateStart, schema.localDateEnd, availabilities));
  };

  private readonly mapToCalendar = (availabilities: AvailabilityModel[]): AvailabilityCalendarModel[] => {
    const groupedAvailabilities = availabilities.reduce((acc: Record<string, AvailabilityModel[]>, availability) => {
      const [date, _] = availability.id.split('T');
      acc[date] = acc[date] ? [...acc[date], availability] : [availability];
      return acc;
    }, {});

    return Object.keys(groupedAvailabilities)
      .map((key) => {
        const max = groupedAvailabilities[key].reduce((prev, current) =>
          prev.vacancies! > current.vacancies! ? prev : current,
        );
        return max;
      })
      .map(
        (model) =>
          new AvailabilityCalendarModel({
            localDate: model.id.split('T')[0],
            available: model.available,
            status: model.status,
            vacancies: model.vacancies,
            capacity: model.capacity,
            paxCount: 0,
            utcCutoffAt: model.utcCutoffAt,
            openingHours: model.openingHours,
            availabilityLocalStartTimes: [],
            availabilityCalendarPricingModel: model.availabilityPricingModel as AvailabilityCalendarPricingModel,
          }),
      );
  };

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
}
