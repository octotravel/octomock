import { BookingStatus, Ticket } from "@octocloud/types";
import {
  CancelBookingSchema,
  ConfirmBookingSchema,
  ExtendBookingSchema,
  UpdateBookingSchema,
} from "../schemas/Booking";
import { DateHelper } from "../helpers/DateHelper";
import { BookingModel, UnitItemModel } from "@octocloud/generators";
import { ContactFactory } from "../factories/ContactFactory";
import { UnitItemModelFactory } from "../factories/UnitItemModelFactory";
import { TicketFactory } from "../factories/TicketFactory";
import addMinutes from "date-fns/addMinutes";

interface IBookingService {
  updateBookingModelWithConfirmBookingSchema(
    bookingModel: BookingModel,
    confirmBookingSchema: ConfirmBookingSchema
  ): BookingModel;
}

export class BookingService implements IBookingService {
  public updateBookingModelWithConfirmBookingSchema(
    bookingModel: BookingModel,
    confirmBookingSchema: ConfirmBookingSchema
  ): BookingModel {
    const status = BookingStatus.CONFIRMED;

    const unitItemModels = UnitItemModelFactory.createMultipleForBookingWithTickets({
      bookingModel: bookingModel,
      bookingUnitItemSchemas: confirmBookingSchema.unitItems,
    });

    bookingModel.resellerReference =
      confirmBookingSchema.resellerReference ?? bookingModel.resellerReference;
    bookingModel.status = status;
    bookingModel.contact = ContactFactory.createForBooking({
      bookingModel: bookingModel,
      bookingContactScheme: confirmBookingSchema.contact,
    });
    bookingModel.unitItemModels = unitItemModels;
    bookingModel.utcUpdatedAt = DateHelper.utcDateFormat(new Date());
    bookingModel.utcExpiresAt = null;
    bookingModel.utcRedeemedAt = null;
    bookingModel.utcConfirmedAt = DateHelper.utcDateFormat(new Date());
    bookingModel.notes = confirmBookingSchema.notes ?? bookingModel.notes;
    bookingModel.voucher = this.getVoucher(bookingModel, status);

    return bookingModel;
  }

  public updateBookingModelWithUpdateBookingSchema(
    bookingModel: BookingModel,
    updateBookingSchema: UpdateBookingSchema,
    rebookedBooking?: BookingModel
  ): BookingModel {
    const status = bookingModel.status;

    let utcExpiresAt = bookingModel.utcExpiresAt;
    if (updateBookingSchema.expirationMinutes) {
      utcExpiresAt = DateHelper.utcDateFormat(
        addMinutes(new Date(), updateBookingSchema.expirationMinutes)
      );
    }

    const unitItemModels = this.getUpdatedUnitItems(
      bookingModel,
      updateBookingSchema,
      rebookedBooking
    );

    bookingModel.resellerReference =
      updateBookingSchema.resellerReference ?? bookingModel.resellerReference;
    bookingModel.status = status;
    bookingModel.productModel = rebookedBooking?.productModel ?? bookingModel.productModel;
    bookingModel.optionModel = rebookedBooking?.optionModel ?? bookingModel.optionModel;
    (bookingModel.availability = rebookedBooking?.availability ?? bookingModel.availability),
      (bookingModel.contact = ContactFactory.createForBooking({
        bookingModel: bookingModel,
        bookingContactScheme: updateBookingSchema.contact,
      }));
    bookingModel.unitItemModels = unitItemModels;
    bookingModel.utcUpdatedAt = DateHelper.utcDateFormat(new Date());
    bookingModel.utcExpiresAt = utcExpiresAt;
    bookingModel.utcRedeemedAt = null;
    bookingModel.notes = updateBookingSchema.notes ?? bookingModel.notes;
    bookingModel.voucher = this.getVoucher(rebookedBooking ?? bookingModel, status);

    return bookingModel;
  }

  public updateBookingModelWithExtendBookingSchema(
    bookingModel: BookingModel,
    extendBookingSchema: ExtendBookingSchema
  ): BookingModel {
    const status = BookingStatus.ON_HOLD;

    bookingModel.status = status;
    bookingModel.utcUpdatedAt = DateHelper.utcDateFormat(new Date());
    bookingModel.utcExpiresAt = DateHelper.utcDateFormat(
      addMinutes(new Date(), extendBookingSchema.expirationMinutes ?? 30)
    );
    bookingModel.utcRedeemedAt = null;
    bookingModel.utcConfirmedAt = null;
    bookingModel.voucher = this.getVoucher(bookingModel, status);

    return bookingModel;
  }

  public updateBookingModelWithCancelBookingSchema(
    bookingModel: BookingModel,
    schema: CancelBookingSchema
  ): BookingModel {
    const status = BookingStatus.CANCELLED;

    const cancellation = {
      refund: "FULL",
      reason: schema.reason ?? null,
      utcCancelledAt: DateHelper.utcDateFormat(new Date()),
    };

    bookingModel.status = status;
    bookingModel.utcUpdatedAt = DateHelper.utcDateFormat(new Date());
    bookingModel.utcExpiresAt = null;
    bookingModel.utcRedeemedAt = null;
    bookingModel.voucher = this.getVoucher(bookingModel, status);
    bookingModel.cancellation = cancellation;
    bookingModel.cancellable = false;

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

  private getUpdatedUnitItems = (
    bookingModel: BookingModel,
    schema: UpdateBookingSchema,
    rebookedBooking?: BookingModel
  ): UnitItemModel[] => {
    if (schema.unitItems) {
      return bookingModel.status === BookingStatus.CONFIRMED
        ? UnitItemModelFactory.createMultipleForBookingWithTickets({
            bookingModel: rebookedBooking ?? bookingModel,
            bookingUnitItemSchemas: schema.unitItems,
          })
        : UnitItemModelFactory.createMultipleForBooking({
            bookingModel: bookingModel,
            bookingUnitItemSchemas: schema.unitItems,
          });
    }

    return rebookedBooking?.unitItemModels ?? bookingModel.unitItemModels;
  };
}
