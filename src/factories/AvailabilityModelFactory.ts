import {
  AvailabilityModel,
  AvailabilityModelGenerator,
  OptionModel,
  ProductModel,
  OfferModel,
} from "@octocloud/generators";
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
import { InvalidOptionIdError, InvalidUnitIdError } from "../models/Error";
import { DateHelper } from "../helpers/DateHelper";
import R from "ramda";

const defaultPricing = {
  original: 0,
  retail: 0,
  net: 0,
  currency: "",
  currencyPrecision: 0,
  includedTaxes: [],
};

interface AvailabilityPricingData {
  unitPricing: PricingUnit[];
  pricing: Pricing;
}

export abstract class AvailabilityModelFactory {
  private static availabilityModelGenerator: AvailabilityModelGenerator = new AvailabilityModelGenerator();

  public static createMultiple({
    productWithAvailabilityModel,
    offerModels,
    optionId,
    date,
    capabilities,
    availabilityUnits,
  }: {
    productWithAvailabilityModel: ProductWithAvailabilityModel;
    offerModels: OfferModel[];
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
          offerModels: offerModels,
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
    offerModels,
    optionId,
    date,
    capabilities,
    status,
    capacity,
    availabilityUnits,
  }: {
    productModel: ProductModel;
    productAvailabilityModel: ProductAvailabilityModel;
    offerModels: OfferModel[];
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

      const availabilityPricing = this.getAvailabilityPricing({
        productModel,
        productAvailabilityModel,
        optionId,
        availabilityUnits,
      });
      const pricingPer = productModel.getProductPricingModel().pricingPer;

      const shouldUsePricing: boolean =
        (availabilityUnits !== undefined && availabilityUnits.length > 0) || pricingPer === PricingPer.BOOKING;
      const shouldUseUnitPricing: boolean = pricingPer === PricingPer.UNIT;

      const appliedOfferModel = offerModels[0];

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
          offerCode: appliedOfferModel.code,
          offerTitle: appliedOfferModel.title,
          offers: offerModels,
          offer: appliedOfferModel,
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
    availabilityUnits,
  }: {
    productModel: ProductModel;
    productAvailabilityModel: ProductAvailabilityModel;
    optionId: string;
    availabilityUnits?: AvailabilityUnit[];
  }): AvailabilityPricingData {
    const pricingPer = productModel.getProductPricingModel().pricingPer;

    if (availabilityUnits && pricingPer === PricingPer.UNIT) {
      const unitPricing = productAvailabilityModel.getUnitPricing(optionId);
      const pricing = availabilityUnits
        .map(({ id, quantity }) => {
          const uPricing: Nullable<PricingUnit> = unitPricing.find((p) => p.unitId === id) ?? null;
          if (uPricing === null) {
            throw new InvalidUnitIdError(id);
          }
          const pricing: Pricing = R.omit(["unitId"], uPricing);
          return new Array(quantity).fill(pricing);
        })
        .flat(1)
        .reduce(
          (acc, unitPricing) => ({
            original: acc.original + unitPricing.original,
            retail: acc.retail + unitPricing.retail,
            net: acc.net + unitPricing.net,
            currency: unitPricing.currency,
            currencyPrecision: unitPricing.currencyPrecision,
            includedTaxes: [...acc.includedTaxes, ...unitPricing.includedTaxes],
          }),
          defaultPricing
        );
      return {
        unitPricing,
        pricing,
      };
    }

    return {
      unitPricing: productAvailabilityModel.getUnitPricing(optionId),
      pricing: productAvailabilityModel.getPricing(optionId),
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
