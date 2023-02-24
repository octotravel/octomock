import { AvailabilityModel, AvailabilityModelGenerator, OptionModel, ProductModel } from "@octocloud/generators";
import { addDays, addHours, addMinutes, eachDayOfInterval, getDay, getMonth, startOfDay } from "date-fns";
import { ProductWithAvailabilityModel } from "../models/ProductWithAvailabilityModel";
import { ProductAvailabilityModel } from "../models/ProductAvailabilityModel";
import {
  AvailabilityStatus,
  AvailabilityUnit,
  CapabilityId,
  DurationUnit,
  PricingPer,
  PricingUnit,
  Pricing,
} from "@octocloud/types";
import { InvalidOptionIdError } from "../models/Error";
import { DateHelper } from "../helpers/DateFormatter";
import { OfferWithDiscountModel } from "../models/OfferWithDiscountModel";
import { PricingFactory } from "./PricingFactory";
import { PricingOfferDiscountCalculator } from "../services/pricing/PricingOfferDiscountCalculator";

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

    const dates = days
      .map((day) => {
        const isClosed =
          productAvailabilityModel.daysClosed.includes(getDay(day)) ||
          productAvailabilityModel.monthsClosed.includes(getMonth(day));

        if (isClosed) {
          return null;
        }

        const availabilityModels = this.buildModel({
          productModel: productModel,
          productAvailabilityModel: productAvailabilityModel,
          offerWithDiscountModels: offerWithDiscountModels,
          optionId: optionId,
          date: DateHelper.availabilityDateFormat(day),
          status: this.getStatusForDate(productAvailabilityModel, day),
          capabilities: capabilities,
          capacity: productAvailabilityModel.freesale
            ? null
            : productAvailabilityModel.capacity.get(getDay(day)) ?? null,
          availabilityUnits: availabilityUnits,
        });

        return availabilityModels;
      })
      .flat(1);

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
      ? availabilityUnits.reduce((acc, availabilityUnit) => {
          return acc + availabilityUnit.quantity;
        }, 0)
      : null;

    const availabilities = optionModel.availabilityLocalStartTimes.map((startTime) => {
      const datetime = new Date(`${date}T${startTime}`);
      const localDateTimeStart = DateHelper.availabilityIdFormat(datetime, productModel.timeZone);

      const localDateTimeEnd = this.calculateTimeEnd(datetime, optionModel, productModel.timeZone);

      const availabilityStatus = this.getStatus({
        status,
        unitsCount,
        capacity,
      });

      const activeOffer = offerWithDiscountModels.length > 0 ? offerWithDiscountModels[0] : undefined;

      const availabilityPricing = this.getAvailabilityPricing({
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

      const availability = this.availabilityModelGenerator.generateAvailability({
        availabilityData: {
          id: localDateTimeStart,
          localDateTimeStart: localDateTimeStart,
          localDateTimeEnd: localDateTimeEnd,
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
        capabilities: capabilities,
        pricingPer: pricingPer,
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
    let unitPricing;
    let pricing;

    if (availabilityUnits === undefined || pricingPer !== PricingPer.UNIT) {
      unitPricing = productAvailabilityModel.getUnitPricing(optionId);

      if (offerWithDiscountModel !== undefined) {
        pricing = PricingFactory.createSummarizedPricing(unitPricing);
      } else {
        pricing = productAvailabilityModel.getPricing(optionId);
      }
    } else {
      unitPricing = productAvailabilityModel.getUnitPricing(optionId);
      const availabilityUnitsPricing = PricingFactory.createFromAvailabilityUnits(unitPricing, availabilityUnits);
      pricing = PricingFactory.createSummarizedPricing(availabilityUnitsPricing);
    }

    if (offerWithDiscountModel !== undefined) {
      unitPricing.map((specificUnitPricing: PricingUnit) => {
        return this.pricingOfferDiscountCalculator.createDiscountedPricing(specificUnitPricing, offerWithDiscountModel);
      });
    }

    return {
      unitPricing: unitPricing,
      pricing: pricing,
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

  private static calculateTimeEnd = (date: Date, optionModel: OptionModel, timeZone: string) => {
    if (
      optionModel.optionContentModel?.durationAmount !== undefined &&
      optionModel.optionContentModel.durationAmount !== "0"
    ) {
      if (optionModel.optionContentModel.durationUnit === DurationUnit.HOUR) {
        return DateHelper.availabilityIdFormat(
          addHours(date, Number(optionModel.optionContentModel.durationAmount)),
          timeZone
        );
      } else if (optionModel.optionContentModel.durationUnit === DurationUnit.MINUTE) {
        return DateHelper.availabilityIdFormat(
          addMinutes(date, Number(optionModel.optionContentModel.durationAmount)),
          timeZone
        );
      } else if (optionModel.optionContentModel.durationUnit === DurationUnit.DAY) {
        return DateHelper.availabilityIdFormat(
          addDays(date, Number(optionModel.optionContentModel.durationAmount)),
          timeZone
        );
      }
    }

    return DateHelper.availabilityIdFormat(startOfDay(addDays(date, 1)), timeZone);
  };
}
