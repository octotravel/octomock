import { BookingModel, UnitItemModel } from "@octocloud/generators";
import { UpdateBookingSchema } from "../../schemas/Booking";
import { ContactFactory } from "../../factories/ContactFactory";
import { TicketFactory } from "../../factories/TicketFactory";
import { BookingStatus, Ticket, Pricing } from "@octocloud/types";
import { DateHelper } from "../../helpers/DateHelper";
import addMinutes from "date-fns/addMinutes";
import { OfferRepository } from "../../repositories/OfferRepository";
import { UnitItemModelFactory } from "../../factories/UnitItemModelFactory";
import { BookingOffersModel } from "@octocloud/generators/dist/models/booking/BookingOffersModel";
import { OfferDiscountType } from "../../models/OfferDiscountModel";
import { BookingPricingModel } from "@octocloud/generators/dist/models/booking/BookingPricingModel";

interface IBookingUpdateService {
  updateBookingBySchema(
    bookingModel: BookingModel,
    updateBookingSchema: UpdateBookingSchema,
    rebookedBooking?: BookingModel
  ): BookingModel;
}

export class BookingUpdateService implements IBookingUpdateService {
  private readonly offerRepository = new OfferRepository();

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
    this.applyOfferDiscountToBooking(bookingModel, updateBookingSchema.offerCode);

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

  private applyOfferDiscountToBooking(bookingModel: BookingModel, offerCode?: string) {
    if (offerCode === undefined || bookingModel.bookingPricingModel === undefined) {
      return;
    }

    const offerWithDiscount = this.offerRepository.getOfferWithDiscount(offerCode);

    if (offerWithDiscount === null) {
      return;
    }

    const offerDiscountModel = offerWithDiscount.offerDiscountModel;
    const offerModel = offerWithDiscount.toOfferModel();

    bookingModel.bookingOffersModel = new BookingOffersModel({
      offerCode: offerModel.code,
      offerTitle: offerModel.title,
      offerComparisons: [],
      offerIsCombination: false,
      offerModels: [offerModel],
      offerModel: offerModel,
    });

    const discountedBookingPricing: Pricing = { ...bookingModel.bookingPricingModel.pricing };
    let discount: number;

    switch (offerDiscountModel.type) {
      case OfferDiscountType.FLAT:
        discount = offerDiscountModel.amount;
        break;
      case OfferDiscountType.PERCENTAGE:
        discount = (discountedBookingPricing.original / 100) * offerDiscountModel.amount;
        break;
      default:
        discount = 0;
    }

    discountedBookingPricing.retail -= discount;

    bookingModel.bookingPricingModel = new BookingPricingModel({
      pricing: discountedBookingPricing,
    });
  }
}
