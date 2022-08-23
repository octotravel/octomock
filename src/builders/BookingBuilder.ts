import { addMinutes } from "date-fns";
import {
  DeliveryFormat,
  DeliveryMethod,
  BookingStatus,
  BookingAvailability,
  Ticket,
  RedemptionMethod,
  BookingUnitItemSchema,
  BookingContactSchema,
} from "@octocloud/types";

import {
  ConfirmBookingSchema,
  CreateBookingSchema,
  CancelBookingSchema,
  ExtendBookingSchema,
  UpdateBookingSchema,
} from "../schemas/Booking";
import { UnitItemModel } from "./../models/UnitItemModel";
import { InvalidOptionIdError, InvalidUnitIdError } from "./../models/Error";
import { DataGenerator } from "./../generators/DataGenerator";
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

    const voucher = this.createVoucher(data.product);

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
      unitItemModels: this.generateTickets(booking, schema.unitItems),
      utcCreatedAt: booking.utcCreatedAt,
      utcUpdatedAt: DateHelper.utcDateFormat(new Date()),
      utcExpiresAt: null,
      utcRedeemedAt: null,
      utcConfirmedAt: DateHelper.utcDateFormat(new Date()),
      notes: schema.notes ?? booking.notes,
      voucher: this.getVoucher(booking, status),
    });

    return bookingModel;
  }

  updateBooking(
    booking: BookingModel,
    schema: UpdateBookingSchema,
    rebookedBooking?: BookingModel
  ): BookingModel {
    const status = booking.status;

    let utcExpiresAt = booking.utcExpiresAt;
    if (schema.expirationMinutes) {
      utcExpiresAt = DateHelper.utcDateFormat(
        addMinutes(new Date(), schema.expirationMinutes)
      );
    }

    const unitItemModels = this.updateUnitItems(
      booking,
      schema,
      rebookedBooking
    );
    const bookingModel = new BookingModel({
      id: booking.id,
      uuid: booking.uuid,
      resellerReference: schema.resellerReference ?? booking.resellerReference,
      supplierReference: booking.supplierReference,
      status,
      product:
        rebookedBooking?.product.setOnBooking() ??
        booking.product.setOnBooking(),
      option:
        rebookedBooking?.option.setOnBooking() ?? booking.option.setOnBooking(),
      availability: rebookedBooking?.availability ?? booking.availability,
      contact: this.updateContact({
        booking: rebookedBooking ?? booking,
        contact: schema.contact,
      }),
      unitItemModels,
      utcCreatedAt: booking.utcCreatedAt,
      utcUpdatedAt: DateHelper.utcDateFormat(new Date()),
      utcExpiresAt: utcExpiresAt,
      utcRedeemedAt: null,
      utcConfirmedAt: booking.utcConfirmedAt,
      notes: schema.notes ?? booking.notes,
      voucher: this.getVoucher(rebookedBooking ?? booking, status),
    });

    return bookingModel;
  }

  private updateUnitItems = (
    booking: BookingModel,
    schema: UpdateBookingSchema,
    rebookedBooking?: BookingModel
  ): UnitItemModel[] => {
    if (schema.unitItems) {
      return booking.status === BookingStatus.CONFIRMED
        ? this.generateTickets(rebookedBooking ?? booking, schema.unitItems)
        : this.buildUnitItems(booking, schema.unitItems);
    }

    return rebookedBooking.unitItemModels ?? booking.unitItemModels;
  };

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
      voucher: this.getVoucher(booking, status),
    });

    return bookingModel;
  }

  private getVoucher = (
    booking: BookingModel,
    status: BookingStatus
  ): Ticket => {
    if (status === BookingStatus.CONFIRMED) {
      return this.generateVoucher(booking);
    }
    if (status === BookingStatus.CANCELLED) {
      return this.createVoucher(booking.product);
    }

    return booking.voucher;
  };

  private createVoucher = (product: ProductModel): Nullable<Ticket> => {
    const voucherAvailabile = product.deliveryMethods.includes(
      DeliveryMethod.VOUCHER
    );
    return voucherAvailabile
      ? {
          redemptionMethod: product.redemptionMethod,
          utcRedeemedAt: null,
          deliveryOptions: [],
        }
      : null;
  };

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
      utcConfirmedAt: booking.utcConfirmedAt,
      notes: booking.notes,
      voucher: this.getVoucher(booking, status),
      cancellation,
      cancellable: false,
    });

    return bookingModel;
  }

  private generateTickets = (
    booking: BookingModel,
    unitItems: BookingUnitItemSchema[]
  ): UnitItemModel[] => {
    const unitItemModel = this.buildUnitItems(booking, unitItems);
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

  private buildUnitItems = (
    booking: BookingModel,
    unitItems: BookingUnitItemSchema[]
  ) => {
    return unitItems
      ? unitItems.map((item) =>
          this.buildUnitItem(
            item,
            booking.status,
            booking.option,
            booking.deliveryMethods
          )
        )
      : booking.unitItemModels;
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
    contact?: BookingContactSchema;
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
    item: BookingUnitItemSchema,
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
