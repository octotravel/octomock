import { addMinutes } from "date-fns";
import {
  DeliveryFormat,
  DeliveryMethod,
  BookingStatus,
  BookingAvailability,
  Ticket,
  RedemptionMethod,
} from "@octocloud/types";
import { UnitItemModel } from "./../models/UnitItemModel";
import { InvalidOptionIdError, InvalidUnitIdError } from "./../models/Error";
import { DataGenerator } from "./../generators/DataGenerator";
import {
  ConfirmBookingSchema,
  CreateBookingSchema,
  OctoUnitItem,
  Contact,
  CancelBookingSchema,
  ExtendBookingSchema,
  UpdateBookingSchema,
} from "./../schemas/Booking";
import { OptionModel } from "./../models/Option";
import { ProductModel } from "./../models/Product";
import { BookingModel } from "./../models/Booking";
import { DateHelper } from "../helpers/DateHelper";

interface BookingBuilderData {
  product: ProductModel;
  availability: BookingAvailability;
}

export class BookingBuilder {
  createBooking(
    data: BookingBuilderData,
    schema: CreateBookingSchema
  ): BookingModel {
    const status = BookingStatus.ON_HOLD;
    const option = data.product.getOption(schema.optionId);
    if (option === null) {
      throw new InvalidOptionIdError(schema.optionId);
    }

    let utcExpiresAt = DateHelper.utcDateFormat(addMinutes(new Date(), 30));
    if (schema.expirationMinutes) {
      utcExpiresAt = DateHelper.utcDateFormat(
        addMinutes(new Date(), schema.expirationMinutes)
      );
    }

    const voucherAvailabile = data.product.deliveryMethods.includes(
      DeliveryMethod.VOUCHER
    );
    const voucher = voucherAvailabile
      ? {
          redemptionMethod: data.product.redemptionMethod,
          utcRedeemedAt: null,
          deliveryOptions: [],
        }
      : null;

    const bookingModel = new BookingModel({
      id: DataGenerator.generateUUID(),
      uuid: schema.uuid ?? DataGenerator.generateUUID(),
      resellerReference: schema.resellerReference ?? null,
      supplierReference: DataGenerator.generateSupplierReference(),
      status,
      product: data.product.setOnBooking(),
      option: option.setOnBooking(),
      availability: data.availability,
      contact: this.updateContact({ booking: null, contact: schema.contact }),
      unitItemModels: schema.unitItems.map((item) =>
        this.buildUnitItem(item, status, option, data.product.deliveryMethods)
      ),
      utcCreatedAt: DateHelper.utcDateFormat(new Date()),
      utcUpdatedAt: DateHelper.utcDateFormat(new Date()),
      utcExpiresAt: utcExpiresAt,
      voucher,
      utcRedeemedAt: null,
      utcConfirmedAt: null,
      notes: schema.notes ?? null,
      freesale: schema.freesale,
    });

    return bookingModel;
  }

  confirmBooking(
    booking: BookingModel,
    schema: ConfirmBookingSchema
  ): BookingModel {
    const status = BookingStatus.CONFIRMED;

    const bookingModel = new BookingModel({
      id: booking.id,
      uuid: booking.uuid,
      resellerReference: schema.resellerReference ?? booking.resellerReference,
      supplierReference: booking.supplierReference,
      status,
      product: booking.product.setOnBooking(),
      option: booking.option.setOnBooking(),
      availability: booking.availability,
      contact: this.updateContact({ booking, contact: schema.contact }),
      unitItemModels: this.generateTickets(booking, schema),
      utcCreatedAt: booking.utcCreatedAt,
      utcUpdatedAt: DateHelper.utcDateFormat(new Date()),
      utcExpiresAt: null,
      utcRedeemedAt: null,
      utcConfirmedAt: DateHelper.utcDateFormat(new Date()),
      notes: schema.notes ?? booking.notes,
      voucher: this.generateVoucher(booking),
      freesale: schema.freesale,
    });

    return bookingModel;
  }

  updateBooking(
    booking: BookingModel,
    schema: UpdateBookingSchema
  ): BookingModel {
    const status = booking.status;

    let utcExpiresAt = booking.utcExpiresAt;
    if (schema.expirationMinutes) {
      utcExpiresAt = DateHelper.utcDateFormat(
        addMinutes(new Date(), schema.expirationMinutes)
      );
    }

    const unitItemModels = schema.unitItems
      ? schema.unitItems.map((item) =>
          this.buildUnitItem(
            item,
            status,
            booking.option,
            booking.deliveryMethods
          )
        )
      : booking.unitItemModels;
    const bookingModel = new BookingModel({
      id: booking.id,
      uuid: booking.uuid,
      resellerReference: schema.resellerReference ?? booking.resellerReference,
      supplierReference: booking.supplierReference,
      status,
      product: booking.product.setOnBooking(),
      option: booking.option.setOnBooking(),
      availability: booking.availability,
      contact: this.updateContact({ booking, contact: schema.contact }),
      unitItemModels,
      utcCreatedAt: booking.utcCreatedAt,
      utcUpdatedAt: DateHelper.utcDateFormat(new Date()),
      utcExpiresAt: utcExpiresAt,
      utcRedeemedAt: null,
      utcConfirmedAt: DateHelper.utcDateFormat(new Date()),
      notes: schema.notes ?? booking.notes,
      voucher: booking.voucher,
      freesale: schema.freesale,
    });

    return bookingModel;
  }

  extendBooking(
    booking: BookingModel,
    schema: ExtendBookingSchema
  ): BookingModel {
    const status = BookingStatus.ON_HOLD;

    const bookingModel = new BookingModel({
      id: booking.id,
      uuid: booking.uuid,
      resellerReference: booking.resellerReference,
      supplierReference: booking.supplierReference,
      status,
      product: booking.product.setOnBooking(),
      option: booking.option.setOnBooking(),
      availability: booking.availability,
      contact: booking.contact,
      unitItemModels: booking.unitItemModels,
      utcCreatedAt: booking.utcCreatedAt,
      utcUpdatedAt: DateHelper.utcDateFormat(new Date()),
      utcExpiresAt: DateHelper.utcDateFormat(
        addMinutes(new Date(), schema.expirationMinutes ?? 30)
      ),
      utcRedeemedAt: null,
      utcConfirmedAt: null,
      notes: booking.notes,
      voucher: booking.voucher,
      freesale: booking.freesale,
    });

    return bookingModel;
  }

  cancelBooking(
    booking: BookingModel,
    schema: CancelBookingSchema
  ): BookingModel {
    const status = BookingStatus.CANCELLED;
    const cancellation = {
      refund: "FULL",
      reason: schema.reason ?? null,
      utcCancelledAt: DateHelper.utcDateFormat(new Date()),
    };

    const voucherAvailabile = booking.product.deliveryMethods.includes(
      DeliveryMethod.VOUCHER
    );
    const voucher = voucherAvailabile
      ? {
          redemptionMethod: booking.product.redemptionMethod,
          utcRedeemedAt: null,
          deliveryOptions: [],
        }
      : null;


    const bookingModel = new BookingModel({
      id: booking.id,
      uuid: booking.uuid,
      resellerReference: booking.resellerReference,
      supplierReference: booking.supplierReference,
      status,
      product: booking.product.setOnBooking(),
      option: booking.option.setOnBooking(),
      availability: booking.availability,
      contact: booking.contact,
      unitItemModels: [],
      utcCreatedAt: booking.utcCreatedAt,
      utcUpdatedAt: DateHelper.utcDateFormat(new Date()),
      utcExpiresAt: null,
      utcRedeemedAt: null,
      utcConfirmedAt: null,
      notes: booking.notes,
      voucher,
      cancellation,
      cancellable: false,
      freesale: booking.freesale,
    });

    return bookingModel;
  }

  private generateTickets = (
    booking: BookingModel,
    schema: ConfirmBookingSchema
  ): UnitItemModel[] => {
    const unitItemModel = schema.unitItems
      ? schema.unitItems.map((item) =>
          this.buildUnitItem(
            item,
            booking.status,
            booking.option,
            booking.deliveryMethods
          )
        )
      : booking.unitItemModels;
    if (booking.deliveryMethods.includes(DeliveryMethod.TICKET)) {
      return unitItemModel.map((item) => {
        const deliveryOptions = [];
        if (booking.product.deliveryFormats.includes(DeliveryFormat.PDF_URL)) {
          deliveryOptions.push({
            deliveryFormat: DeliveryFormat.PDF_URL,
            deliveryValue: `https://api.octomock.com/octo/pdf?booking=${booking.uuid}&ticket=${item.uuid}`,
          });
        }
        if (booking.product.deliveryFormats.includes(DeliveryFormat.QRCODE)) {
          deliveryOptions.push({
            deliveryFormat: DeliveryFormat.QRCODE,
            deliveryValue: item.supplierReference,
          });
        }
        const ticket = {
          ...item.ticket,
          deliveryOptions,
        };

        return item.updateTicket(ticket);
      });
    }
  };

  private generateVoucher = (booking: BookingModel): Nullable<Ticket> => {
    if (booking.deliveryMethods.includes(DeliveryMethod.VOUCHER)) {
      const deliveryOptions = [];
      if (booking.product.deliveryFormats.includes(DeliveryFormat.PDF_URL)) {
        deliveryOptions.push({
          deliveryFormat: DeliveryFormat.PDF_URL,
          deliveryValue: `https://api.octomock.com/octo/pdf?booking=${booking.uuid}`,
        });
      }
      if (booking.product.deliveryFormats.includes(DeliveryFormat.QRCODE)) {
        deliveryOptions.push({
          deliveryFormat: DeliveryFormat.QRCODE,
          deliveryValue: booking.supplierReference,
        });
      }
      return {
        redemptionMethod: booking.product.redemptionMethod,
        utcRedeemedAt: null,
        deliveryOptions: deliveryOptions,
      };
    }
    return null;
  };

  private updateContact = ({
    booking,
    contact,
  }: {
    booking: Nullable<BookingModel>;
    contact?: Contact;
  }) => {
    return {
      fullName: contact?.fullName ?? booking?.contact?.fullName ?? null,
      firstName: contact?.firstName ?? booking?.contact?.firstName ?? null,
      lastName: contact?.lastName ?? booking?.contact?.lastName ?? null,
      emailAddress:
        contact?.emailAddress ?? booking?.contact?.emailAddress ?? null,
      phoneNumber:
        contact?.phoneNumber ?? booking?.contact?.phoneNumber ?? null,
      locales: contact?.locales ?? booking?.contact?.locales ?? [],
      country: contact?.country ?? booking?.contact?.country ?? null,
      notes: contact?.notes ?? booking?.contact?.notes ?? null,
    };
  };

  private buildUnitItem = (
    item: OctoUnitItem,
    status: BookingStatus,
    option: OptionModel,
    deliveryMethods: DeliveryMethod[]
  ): UnitItemModel => {
    const unitModel = option.findUnitModel(item.unitId);
    if (unitModel === null) {
      throw new InvalidUnitIdError(item.unitId);
    }
    const ticketAvailable = deliveryMethods.includes(DeliveryMethod.TICKET);

    const ticket = ticketAvailable
      ? {
          redemptionMethod: RedemptionMethod.DIGITAL,
          utcRedeemedAt: null,
          deliveryOptions: [],
        }
      : null;

    return new UnitItemModel({
      uuid: item.uuid ?? DataGenerator.generateUUID(),
      supplierReference: DataGenerator.generateSupplierReference(),
      resellerReference: item.resellerReference ?? null,
      unitModel,
      status,
      ticket,
    });
  };
}
