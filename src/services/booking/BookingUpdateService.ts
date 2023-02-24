import { BookingModel, UnitItemModel } from "@octocloud/generators";
import { UpdateBookingSchema } from "../../schemas/Booking";
import { ContactFactory } from "../../factories/ContactFactory";
import { TicketFactory } from "../../factories/TicketFactory";
import { BookingStatus, Ticket, Pricing, OfferRestrictions } from "@octocloud/types";
import { DateHelper } from "../../helpers/DateFormatter";
import addMinutes from "date-fns/addMinutes";
import { OfferRepository } from "../../repositories/OfferRepository";
import { UnitItemModelFactory } from "../../factories/UnitItemModelFactory";
import { BookingOffersModel } from "@octocloud/generators/dist/models/booking/BookingOffersModel";
import { BookingPricingModel } from "@octocloud/generators/dist/models/booking/BookingPricingModel";
import InvalidOfferCodeError from "../../errors/InvalidOfferCodeError";
import OfferConditionsNotMet from "../../errors/OfferConditionsNotMet";
import { PricingFactory } from "../../factories/PricingFactory";
import { UnitItemPricingModel } from "@octocloud/generators/dist/models/unitItem/UnitItemPricingModel";
import { UnitPricingModel } from "@octocloud/generators/dist/models/unit/UnitPricingModel";
import { PricingOfferDiscountCalculator } from "../pricing/PricingOfferDiscountCalculator";

interface IBookingUpdateService {
  updateBookingBySchema(
    bookingModel: BookingModel,
    updateBookingSchema: UpdateBookingSchema,
    rebookedBooking?: BookingModel
  ): BookingModel;
}

export class BookingUpdateService implements IBookingUpdateService {
  private readonly offerRepository = new OfferRepository();
  private readonly pricingOfferDiscountCalculator = new PricingOfferDiscountCalculator();

  public updateBookingBySchema(
    bookingModel: BookingModel,
    updateBookingSchema: UpdateBookingSchema,
    rebookedBooking?: BookingModel
  ): BookingModel {
    if (updateBookingSchema.expirationMinutes) {
      bookingModel.utcExpiresAt = DateHelper.utcDateFormat(
        addMinutes(new Date(), updateBookingSchema.expirationMinutes)
      );
    }
    bookingModel.resellerReference = updateBookingSchema.resellerReference ?? bookingModel.resellerReference;
    bookingModel.productModel = rebookedBooking?.productModel ?? bookingModel.productModel;
    bookingModel.optionModel = rebookedBooking?.optionModel ?? bookingModel.optionModel;
    bookingModel.availability = rebookedBooking?.availability ?? bookingModel.availability;
    bookingModel.contact = ContactFactory.createForBooking({
      bookingModel: bookingModel,
      bookingContactScheme: updateBookingSchema.contact,
    });
    bookingModel.utcUpdatedAt = DateHelper.utcDateFormat(new Date());
    bookingModel.utcRedeemedAt = null;
    bookingModel.notes = updateBookingSchema.notes ?? bookingModel.notes;
    bookingModel.voucher = this.getVoucher(rebookedBooking ?? bookingModel, bookingModel.status);
    bookingModel.unitItemModels = this.updateUnitItems(bookingModel, updateBookingSchema, rebookedBooking);

    if (updateBookingSchema.offerCode !== undefined && bookingModel.bookingPricingModel !== undefined) {
      this.applyOfferDiscountToBooking(bookingModel, updateBookingSchema.offerCode);
    }

    return bookingModel;
  }

  private getVoucher(bookingModel: BookingModel, status: BookingStatus): Nullable<Ticket> {
    if (status === BookingStatus.CONFIRMED) {
      return TicketFactory.createFromBookingForBooking(bookingModel);
    } else if (status === BookingStatus.CANCELLED) {
      return TicketFactory.createFromProductForBooking(bookingModel.productModel);
    }

    return bookingModel.voucher;
  }

  private updateUnitItems(
    bookingModel: BookingModel,
    schema: UpdateBookingSchema,
    rebookedBooking?: BookingModel
  ): UnitItemModel[] {
    if (schema.unitItems === undefined) {
      return rebookedBooking?.unitItemModels ?? bookingModel.unitItemModels;
    }

    if (bookingModel.status === BookingStatus.CONFIRMED) {
      return UnitItemModelFactory.createMultipleForBookingWithTickets({
        bookingModel: rebookedBooking ?? bookingModel,
        bookingUnitItemSchemas: schema.unitItems,
      });
    }

    return UnitItemModelFactory.createMultipleForBooking({
      bookingModel: bookingModel,
      bookingUnitItemSchemas: schema.unitItems,
    });
  }

  private applyOfferDiscountToBooking(bookingModel: BookingModel, offerCode: string) {
    const offerWithDiscountModel = this.offerRepository.getOfferWithDiscount(offerCode);

    if (offerWithDiscountModel === null) {
      throw new InvalidOfferCodeError(offerCode);
    }

    const bookingPricing = bookingModel.bookingPricingModel!.pricing;
    const bookingUnitItemModels = bookingModel.unitItemModels;

    this.checkOfferRestrictions(offerWithDiscountModel.restrictions, bookingPricing, bookingUnitItemModels.length);

    const offerDiscountModel = offerWithDiscountModel.offerDiscountModel;
    const offerModel = offerWithDiscountModel.toOfferModel();

    bookingModel.bookingOffersModel = new BookingOffersModel({
      offerCode: offerModel.code,
      offerTitle: offerModel.title,
      offerComparisons: [],
      offerIsCombination: false,
      offerModels: [offerModel],
      offerModel: offerModel,
    });

    bookingModel.unitItemModels.forEach((unitItemModel) => {
      const unitItemPricingModel = unitItemModel.getUnitItemPricingModel();
      const unitPricingModel = unitItemModel.unitModel.getUnitPricingModel();

      unitItemModel.unitItemPricingModel = new UnitItemPricingModel({
        pricing: this.pricingOfferDiscountCalculator.createDiscountedPricing(
          unitItemPricingModel.pricing!,
          offerWithDiscountModel
        ),
      });

      const unitPricing = unitPricingModel.pricing;
      let discountedUnitPricing;
      const unitPricingFrom = unitPricingModel.pricingFrom;
      let discountedUnitPricingFrom;

      if (unitPricing !== undefined) {
        discountedUnitPricing = unitPricing.map((pricing) =>
          this.pricingOfferDiscountCalculator.createDiscountedPricing(pricing, offerWithDiscountModel)
        );
      }

      if (unitPricingFrom !== undefined) {
        discountedUnitPricingFrom = unitPricingFrom.map((pricingFrom) =>
          this.pricingOfferDiscountCalculator.createDiscountedPricing(pricingFrom, offerWithDiscountModel)
        );
      }

      unitItemModel.unitModel.unitPricingModel = new UnitPricingModel({
        pricing: discountedUnitPricing,
        pricingFrom: discountedUnitPricingFrom,
      });
    });

    const discountedBookingPricing = PricingFactory.createSummarizedPricing(
      bookingModel.unitItemModels.map((unitItemModel) => unitItemModel.getUnitItemPricingModel().pricing)
    );

    bookingModel.bookingPricingModel = new BookingPricingModel({
      pricing: discountedBookingPricing,
    });
  }

  private checkOfferRestrictions(
    restrictions: OfferRestrictions,
    bookingPricing: Pricing,
    bookingUnitItemModelsCount: number
  ) {
    if (
      (restrictions.minTotal !== null && restrictions.minTotal > bookingPricing.original) ||
      (restrictions.maxTotal !== null && restrictions.maxTotal < bookingPricing.original) ||
      (restrictions.minUnits !== null && restrictions.minUnits > bookingUnitItemModelsCount) ||
      (restrictions.maxUnits !== null && restrictions.maxUnits < bookingUnitItemModelsCount)
    ) {
      throw new OfferConditionsNotMet();
    }
  }
}
