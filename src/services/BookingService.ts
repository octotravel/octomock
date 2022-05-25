import { Booking } from "@octocloud/types";
import { InvalidBookingUUIDError } from "./../models/Error";
import { GetBookingSchema, GetBookingsSchema } from "./../schemas/Booking";
import { BookingModel } from "./../models/Booking";
import { DB } from "../storage/Database";
import { DateHelper } from "../helpers/DateHelper";

interface IBookingService {
  createBooking(bookingModel: BookingModel): Promise<BookingModel>;
  updateBooking(bookingModel: BookingModel): Promise<BookingModel>;
  getBooking(bookingModel: BookingModel): Promise<BookingModel>;
  getBookings(schema: GetBookingsSchema): Promise<BookingModel[]>;
}

export class BookingService implements IBookingService {
  public createBooking = async (
    bookingModel: BookingModel
  ): Promise<BookingModel> => {
    await DB.getInstance()
      .getDB()
      .run(
        `
      INSERT INTO booking (
        id,
        status,
        resellerReference,
        supplierReference,
        data
      ) VALUES (?, ?, ?, ?, ?)
    `,
        bookingModel.uuid,
        bookingModel.status,
        bookingModel.resellerReference,
        bookingModel.supplierReference,
        JSON.stringify(bookingModel.toPOJO({}))
      );
    return bookingModel;
  };

  public updateBooking = async (
    bookingModel: BookingModel
  ): Promise<BookingModel> => {
    await DB.getInstance()
      .getDB()
      .run(
        `
      UPDATE booking
        SET status = ?,
            resellerReference = ?,
            data = ?
        WHERE id = ?
    `,
        bookingModel.status,
        bookingModel.resellerReference,
        JSON.stringify(bookingModel.toPOJO({})),
        bookingModel.uuid
      );
    return bookingModel;
  };

  public getBooking = async (data: GetBookingSchema): Promise<BookingModel> => {
    const result =
      (await DB.getInstance()
        .getDB()
        .get(`SELECT * FROM booking WHERE id = ?`, data.uuid)) ?? null;
    if (result == null) {
      throw new InvalidBookingUUIDError(data.uuid);
    }
    const booking = JSON.parse(result.data) as Booking;
    const bookingModel = BookingModel.fromPOJO(booking);
    this.handleExpiredBooking(bookingModel);
    return bookingModel;
  };

  private handleExpiredBooking = (booking: BookingModel): void => {
    const isExpired =
      booking.utcExpiresAt < DateHelper.utcDateFormat(new Date());
    if (isExpired) {
      throw new InvalidBookingUUIDError(booking.uuid);
    }
  };

  public getBookings = async (
    data: GetBookingsSchema
  ): Promise<BookingModel[]> => {
    if (data.resellerReference) {
      const result = await DB.getInstance()
        .getDB()
        .all(
          `SELECT * FROM booking WHERE resellerReference = ?`,
          data.resellerReference
        );
      return result.map((r) =>
        BookingModel.fromPOJO(JSON.parse(r.data) as Booking)
      );
    }
    if (data.supplierReference) {
      const result = await DB.getInstance()
        .getDB()
        .all(
          `SELECT * FROM booking WHERE supplierReference = ?`,
          data.supplierReference
        );
      return result.map((r) =>
        BookingModel.fromPOJO(JSON.parse(r.data) as Booking)
      );
    }
    const result = await DB.getInstance().getDB().all(`SELECT * FROM booking`);
    return result.map((r) =>
      BookingModel.fromPOJO(JSON.parse(r.data) as Booking)
    );
  };
}
