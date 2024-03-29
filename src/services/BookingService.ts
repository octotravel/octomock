import { BookingStatus, Ticket, BookingUnitItemSchema, OrderStatus, Availability } from '@octocloud/types';
import { BookingModel, AvailabilityModel, OrderModel } from '@octocloud/generators';
import addMinutes from 'date-fns/addMinutes';
import {
  CancelBookingSchema,
  ConfirmBookingSchema,
  ExtendBookingSchema,
  CreateBookingSchema,
} from '../schemas/Booking';
import { DateHelper } from '../helpers/DateFormatter';
import { ContactFactory } from '../factories/ContactFactory';
import { UnitItemModelFactory } from '../factories/UnitItemModelFactory';
import { TicketFactory } from '../factories/TicketFactory';
import { ProductWithAvailabilityModel } from '../models/ProductWithAvailabilityModel';
import { InvalidOptionIdError, InvalidUnitIdError } from '../models/Error';
import { BookingModelFactory } from '../factories/BookingModelFactory';
import { CancelOrderSchema, ConfirmOrderSchema } from '../schemas/Order';

interface IBookingService {
  createBookingModel: (
    schema: CreateBookingSchema,
    productWithAvailabilityModel: ProductWithAvailabilityModel,
    availabilityModel: AvailabilityModel,
  ) => BookingModel;
  confirmBookingBySchema: (bookingModel: BookingModel, confirmBookingSchema: ConfirmBookingSchema) => BookingModel;
  extendBookingBySchema: (bookingModel: BookingModel, extendBookingSchema: ExtendBookingSchema) => BookingModel;
  cancelBookingBySchema: (bookingModel: BookingModel, schema: CancelBookingSchema) => BookingModel;
  cancelBookingByOrder: (bookingModel: BookingModel, orderModel: OrderModel, schema: CancelOrderSchema) => BookingModel;
}

export class BookingService implements IBookingService {
  public createBookingModel(
    schema: CreateBookingSchema,
    productWithAvailabilityModel: ProductWithAvailabilityModel,
    availabilityModel: AvailabilityModel,
  ): BookingModel {
    const bookingAvailability: Availability = {
      id: availabilityModel.id,
      localDateTimeStart: availabilityModel.localDateTimeStart,
      localDateTimeEnd: availabilityModel.localDateTimeEnd,
      allDay: availabilityModel.allDay,
      available: availabilityModel.available,
      status: availabilityModel.status,
      vacancies: availabilityModel.vacancies,
      capacity: availabilityModel.capacity,
      maxUnits: availabilityModel.maxUnits,
      utcCutoffAt: availabilityModel.utcCutoffAt,
      openingHours: availabilityModel.openingHours,
    };

    const optionId = schema.optionId;
    const optionModel = productWithAvailabilityModel.findOptionModelByOptionId(optionId);

    if (optionModel === null) {
      throw new InvalidOptionIdError(optionId);
    }

    schema.unitItems.forEach((bookingUnitItemSchema: BookingUnitItemSchema) => {
      const unitId = bookingUnitItemSchema.unitId;
      const unitModel = optionModel.findUnitModelByUnitId(unitId);

      if (unitModel === null) {
        throw new InvalidUnitIdError(unitId);
      }
    });

    const bookingModel = BookingModelFactory.create(productWithAvailabilityModel, bookingAvailability, schema);

    return bookingModel;
  }

  public confirmBookingBySchema(bookingModel: BookingModel, confirmBookingSchema: ConfirmBookingSchema): BookingModel {
    const unitItemModels = UnitItemModelFactory.createMultipleForBookingWithTickets({
      bookingModel,
      bookingUnitItemSchemas: confirmBookingSchema.unitItems,
    });

    bookingModel.unitItemModels = unitItemModels;
    bookingModel.resellerReference = confirmBookingSchema.resellerReference ?? bookingModel.resellerReference;
    bookingModel.contact = ContactFactory.createForBooking({
      bookingModel,
      bookingContactScheme: confirmBookingSchema.contact,
    });
    bookingModel.notes = confirmBookingSchema.notes ?? bookingModel.notes;

    this.confirmBooking(bookingModel);

    return bookingModel;
  }

  public confirmBookingByOrder(bookingModel: BookingModel, confirmOrderSchema: ConfirmOrderSchema): BookingModel {
    const contact = ContactFactory.createForOrder({
      contact: bookingModel.contact,
      orderContactScheme: confirmOrderSchema.contact,
    });

    bookingModel.contact = contact;

    return this.confirmBooking(bookingModel);
  }

  private confirmBooking(bookingModel: BookingModel): BookingModel {
    const status = BookingStatus.CONFIRMED;

    bookingModel.status = status;
    bookingModel.utcUpdatedAt = DateHelper.utcDateFormat(new Date());
    bookingModel.utcExpiresAt = null;
    bookingModel.utcRedeemedAt = null;
    bookingModel.utcConfirmedAt = DateHelper.utcDateFormat(new Date());
    bookingModel.voucher = this.getVoucher(bookingModel, status);

    return bookingModel;
  }

  public extendBookingBySchema(bookingModel: BookingModel, extendBookingSchema: ExtendBookingSchema): BookingModel {
    const status = BookingStatus.ON_HOLD;

    bookingModel.status = status;
    bookingModel.utcUpdatedAt = DateHelper.utcDateFormat(new Date());
    bookingModel.utcExpiresAt = DateHelper.utcDateFormat(
      addMinutes(new Date(), extendBookingSchema.expirationMinutes ?? 30),
    );
    bookingModel.utcRedeemedAt = null;
    bookingModel.utcConfirmedAt = null;
    bookingModel.voucher = this.getVoucher(bookingModel, status);

    return bookingModel;
  }

  public cancelBookingBySchema(bookingModel: BookingModel, schema: CancelBookingSchema): BookingModel {
    let status = BookingStatus.EXPIRED;

    if (bookingModel.status === BookingStatus.CONFIRMED) {
      status = BookingStatus.CANCELLED;
    }

    return this.cancelBooking(bookingModel, status, schema.reason);
  }

  public cancelBookingByOrder(
    bookingModel: BookingModel,
    orderModel: OrderModel,
    cancelOrderSchema: CancelOrderSchema,
  ): BookingModel {
    let status = BookingStatus.EXPIRED;

    if (orderModel.status === OrderStatus.CONFIRMED) {
      status = BookingStatus.CANCELLED;
    }

    return this.cancelBooking(bookingModel, status, cancelOrderSchema.reason);
  }

  private cancelBooking(bookingModel: BookingModel, status: BookingStatus, reason?: string): BookingModel {
    const cancellation = {
      refund: 'FULL',
      reason: reason ?? null,
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
    }
    if (status === BookingStatus.CANCELLED) {
      return TicketFactory.createFromProductForBooking(bookingModel.productModel);
    }

    return bookingModel.voucher;
  }
}
