import { AvailabilityModel, AvailabilityModelGenerator, OptionModel, ProductModel } from '@octocloud/generators';
import {
  AvailabilityStatus,
  AvailabilityUnit,
  CapabilityId,
  DurationUnit,
  Pricing,
  PricingPer,
  PricingUnit,
} from '@octocloud/types';
import { addDays, addHours, addMinutes, eachDayOfInterval, getDay, getMonth, startOfDay } from 'date-fns';
import { DateHelper } from '../helpers/DateFormatter';
import { InvalidOptionIdError } from '../models/Error';
import { OfferWithDiscountModel } from '../models/OfferWithDiscountModel';
import { ProductAvailabilityModel } from '../models/ProductAvailabilityModel';
import { ProductWithAvailabilityModel } from '../models/ProductWithAvailabilityModel';
import { PricingOfferDiscountCalculator } from '../services/pricing/PricingOfferDiscountCalculator';
import { PricingFactory } from './PricingFactory';

interface AvailabilityPricingData {
  unitPricing: PricingUnit[];
  pricing: Pricing;
}

export abstract class AvailabilityModelFactory {
  private static readonly availabilityModelGenerator: AvailabilityModelGenerator = new AvailabilityModelGenerator();

  private static readonly pricingOfferDiscountCalculator: PricingOfferDiscountCalculator =
    new PricingOfferDiscountCalculator();

  public static createMultiple({
    productWithAvailabilityModel,
    offerWithDiscountModels,
    optionId,
    date,
    capabilities,
    availabilityUnits,
  }: {
    productWithAvailabilityModel: ProductWithAvailabilityModel;
    offerWithDiscountModels: OfferWithDiscountModel[];
    optionId: string;
    date: string;
    capabilities: CapabilityId[];
    availabilityUnits?: AvailabilityUnit[];
  }): AvailabilityModel[] {
    const productModel = productWithAvailabilityModel.toProductModel();
    const productAvailabilityModel = productWithAvailabilityModel.productAvailabilityModel;
    const days = eachDayOfInterval({
      start: new Date(date),
      end: addDays(new Date(date), productAvailabilityModel.days),
    });

    const dates = days.flatMap((day) => {
      const isClosed =
        productAvailabilityModel.daysClosed.includes(getDay(day)) ||
        productAvailabilityModel.monthsClosed.includes(getMonth(day));

      if (isClosed) {
        return null;
      }

      const availabilityModels = AvailabilityModelFactory.buildModel({
        productModel,
        productAvailabilityModel,
        offerWithDiscountModels,
        optionId,
        date: DateHelper.availabilityDateFormat(day),
        status: AvailabilityModelFactory.getStatusForDate(productAvailabilityModel, day),
        capabilities,
        capacity: productAvailabilityModel.freesale
          ? null
          : (productAvailabilityModel.capacity.get(getDay(day)) ?? null),
        availabilityUnits,
      });

      return availabilityModels;
    });

    return dates.flatMap((availabilityModel) => (availabilityModel ? [availabilityModel] : []));
  }

  private static buildModel({
    productModel,
    productAvailabilityModel,
    offerWithDiscountModels,
    optionId,
    date,
    capabilities,
    status,
    capacity,
    availabilityUnits,
  }: {
    productModel: ProductModel;
    productAvailabilityModel: ProductAvailabilityModel;
    offerWithDiscountModels: OfferWithDiscountModel[];
    optionId: string;
    date: string;
    capabilities: CapabilityId[];
    status: AvailabilityStatus;
    capacity: Nullable<number>;
    availabilityUnits?: AvailabilityUnit[];
  }): AvailabilityModel[] {
    const optionModel = productModel.findOptionModelByOptionId(optionId);
    if (optionModel === null) {
      throw new InvalidOptionIdError(optionId);
    }

    const unitsCount = availabilityUnits
      ? availabilityUnits.reduce((acc, availabilityUnit) => acc + availabilityUnit.quantity, 0)
      : null;

    const availabilities = optionModel.availabilityLocalStartTimes.map((startTime) => {
      const datetime = new Date(`${date}T${startTime}`);
      const localDateTimeStart = DateHelper.availabilityIdFormat(datetime, productModel.timeZone);

      const localDateTimeEnd = AvailabilityModelFactory.calculateTimeEnd(datetime, optionModel, productModel.timeZone);

      const availabilityStatus = AvailabilityModelFactory.getStatus({
        status,
        unitsCount,
        capacity,
      });

      const activeOffer = offerWithDiscountModels.length > 0 ? offerWithDiscountModels[0] : undefined;

      const availabilityPricing = AvailabilityModelFactory.getAvailabilityPricing({
        productModel,
        productAvailabilityModel,
        optionId,
        offerWithDiscountModel: activeOffer,
        availabilityUnits,
      });
      const pricingPer = productModel.getProductPricingModel().pricingPer;

      const shouldUsePricing: boolean =
        (availabilityUnits !== undefined && availabilityUnits.length > 0) || pricingPer === PricingPer.BOOKING;
      const shouldUseUnitPricing: boolean = pricingPer === PricingPer.UNIT;

      const availability = AvailabilityModelFactory.availabilityModelGenerator.generateAvailability({
        availabilityData: {
          id: localDateTimeStart,
          localDateTimeStart,
          localDateTimeEnd,
          allDay: optionModel.availabilityLocalStartTimes.length === 1,
          available: availabilityStatus !== AvailabilityStatus.SOLD_OUT,
          status: availabilityStatus,
          vacancies: availabilityStatus === AvailabilityStatus.SOLD_OUT ? 0 : capacity,
          capacity: availabilityStatus === AvailabilityStatus.SOLD_OUT ? 0 : capacity,
          maxUnits: availabilityStatus === AvailabilityStatus.SOLD_OUT ? 0 : optionModel.restrictions.maxUnits,
          utcCutoffAt: DateHelper.utcDateFormat(datetime),
          openingHours: productAvailabilityModel.openingHours,
          unitPricing: shouldUseUnitPricing ? availabilityPricing.unitPricing : undefined,
          pricing: shouldUsePricing ? availabilityPricing.pricing : undefined,
          offerCode: activeOffer?.code ?? undefined,
          offerTitle: activeOffer?.title ?? undefined,
          offers: offerWithDiscountModels,
          offer: activeOffer,
        },
        capabilities,
        pricingPer,
      });

      return availability;
    });
    return availabilities;
  }

  private static getStatusForDate(productAvailabilityModel: ProductAvailabilityModel, day: Date): AvailabilityStatus {
    const isSoldOut =
      productAvailabilityModel.daysSoldOut.includes(getDay(day)) ||
      productAvailabilityModel.daysSoldOut.includes(getMonth(day));

    if (isSoldOut) {
      return AvailabilityStatus.SOLD_OUT;
    }

    if (productAvailabilityModel.freesale) {
      return AvailabilityStatus.FREESALE;
    }

    return AvailabilityStatus.AVAILABLE;
  }

  private static getAvailabilityPricing({
    productModel,
    productAvailabilityModel,
    optionId,
    offerWithDiscountModel,
    availabilityUnits,
  }: {
    productModel: ProductModel;
    productAvailabilityModel: ProductAvailabilityModel;
    optionId: string;
    offerWithDiscountModel?: OfferWithDiscountModel;
    availabilityUnits?: AvailabilityUnit[];
  }): AvailabilityPricingData {
    const pricingPer = productModel.getProductPricingModel().pricingPer;
    let unitPricing: PricingUnit[] = [];
    let pricing: Pricing;

    if (pricingPer === PricingPer.BOOKING) {
      pricing = productAvailabilityModel.getPricing(optionId);
      if (offerWithDiscountModel !== undefined) {
        pricing = PricingFactory.createSummarizedPricing([pricing]);
      }
    } else {
      unitPricing = productAvailabilityModel.getUnitPricing(optionId);
      pricing = PricingFactory.createSummarizedPricing(unitPricing);
      if (availabilityUnits) {
        const availabilityUnitsPricing = PricingFactory.createFromAvailabilityUnits(unitPricing, availabilityUnits);
        pricing = PricingFactory.createSummarizedPricing(availabilityUnitsPricing);
      }
    }

    if (offerWithDiscountModel !== undefined) {
      unitPricing.map((specificUnitPricing: PricingUnit) =>
        AvailabilityModelFactory.pricingOfferDiscountCalculator.createDiscountedPricing(
          specificUnitPricing,
          offerWithDiscountModel,
        ),
      );
    }

    return {
      unitPricing,
      pricing,
    };
  }

  private static getStatus({
    capacity,
    status,
    unitsCount,
  }: {
    capacity: Nullable<number>;
    status: AvailabilityStatus;
    unitsCount: Nullable<number>;
  }): AvailabilityStatus {
    if (capacity === null) {
      return status;
    }

    if (unitsCount) {
      return capacity < unitsCount ? AvailabilityStatus.SOLD_OUT : status;
    }

    if (capacity === 0) {
      return AvailabilityStatus.SOLD_OUT;
    }

    return status;
  }

  private static readonly calculateTimeEnd = (date: Date, optionModel: OptionModel, timeZone: string): string => {
    if (
      optionModel.optionContentModel?.durationAmount !== undefined &&
      optionModel.optionContentModel.durationAmount !== '0'
    ) {
      if (optionModel.optionContentModel.durationUnit === DurationUnit.HOUR) {
        return DateHelper.availabilityIdFormat(
          addHours(date, Number(optionModel.optionContentModel.durationAmount)),
          timeZone,
        );
      }
      if (optionModel.optionContentModel.durationUnit === DurationUnit.MINUTE) {
        return DateHelper.availabilityIdFormat(
          addMinutes(date, Number(optionModel.optionContentModel.durationAmount)),
          timeZone,
        );
      }
      if (optionModel.optionContentModel.durationUnit === DurationUnit.DAY) {
        return DateHelper.availabilityIdFormat(
          addDays(date, Number(optionModel.optionContentModel.durationAmount)),
          timeZone,
        );
      }
    }

    return DateHelper.availabilityIdFormat(startOfDay(addDays(date, 1)), timeZone);
  };
}
