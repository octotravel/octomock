import { DateHelper } from "../helpers/DateHelper";
import { addMinutes } from "date-fns";
import { DataGenerator } from "../generators/DataGenerator";
import { CreateOrderSchema } from "../schemas/Order";
import { OrderStatus } from "@octocloud/types";
import { OrderModelGenerator, OrderModel, BookingModel } from "@octocloud/generators";
import { CreateBookingSchema } from "../schemas/Booking";

export abstract class OrderModelFactory {
  private static orderModelGenerator: OrderModelGenerator = new OrderModelGenerator();

  public static createBySchema(createOrderSchema: CreateOrderSchema): OrderModel {
    const status = OrderStatus.ON_HOLD;

    let utcExpiresAt = DateHelper.utcDateFormat(addMinutes(new Date(), 30));
    if (createOrderSchema.expirationMinutes) {
      utcExpiresAt = DateHelper.utcDateFormat(addMinutes(new Date(), createOrderSchema.expirationMinutes));
    }

    return this.orderModelGenerator.generateOrder({
      orderData: {
        id: DataGenerator.generateUUID(),
        supplierReference: DataGenerator.generateSupplierReference(),
        settlementMethod: "settlementMethod",
        status: status,
        utcExpiresAt: utcExpiresAt,
        utcConfirmedAt: undefined,
        bookings: [],
        contact: createOrderSchema.contact,
      },
    });
  }

  public static createByBooking(bookingModel: BookingModel, createBookingSchema: CreateBookingSchema): OrderModel {
    const status = OrderStatus.ON_HOLD;

    let utcExpiresAt = DateHelper.utcDateFormat(addMinutes(new Date(), 30));
    if (createBookingSchema.expirationMinutes) {
      utcExpiresAt = DateHelper.utcDateFormat(addMinutes(new Date(), createBookingSchema.expirationMinutes));
    }

    return this.orderModelGenerator.generateOrder({
      orderData: {
        id: DataGenerator.generateUUID(),
        supplierReference: bookingModel.supplierReference ?? DataGenerator.generateSupplierReference(),
        settlementMethod: "settlementMethod",
        status: status,
        utcExpiresAt: utcExpiresAt,
        utcConfirmedAt: undefined,
        bookings: [bookingModel],
        contact: bookingModel.contact,
      },
    });
  }
}
