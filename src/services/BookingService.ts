import { Booking } from "./../types/Booking";
import { GetBookingSchema, GetBookingsSchema } from "./../schemas/Booking";
import { BookingModel } from "./../models/Booking";
import { DB } from "../storage/Database";
import { CapabilityId } from "../types/Capability";

interface IBookingService {
  createBooking(
    bookingModel: BookingModel,
    capabilities: CapabilityId[]
  ): Promise<BookingModel>;
  getBooking(
    bookingModel: BookingModel,
    capabilities: CapabilityId[]
  ): Promise<BookingModel>;
  getBookings(schema: GetBookingsSchema): Promise<BookingModel[]>;
}

export class BookingService implements IBookingService {
  public createBooking = async (
    bookingModel: BookingModel,
    _: CapabilityId[]
  ): Promise<BookingModel> => {
    // TODO: build booking model
    const query = await DB.getInstance()
      .getDB()
      .run(
        `
      INSERT INTO booking (
        id,
        resellerReference,
        supplierReference,
        data
      ) VALUES (?, ?, ?, ?)
    `,
        bookingModel.uuid,
        bookingModel.resellerReference ?? null,
        bookingModel.supplierReference ?? null,
        JSON.stringify(bookingModel.toPOJO())
      );
    console.log("data inserted", query);
    return bookingModel;
  };

  public getBooking = async (
    data: GetBookingSchema,
    _: CapabilityId[]
  ): Promise<BookingModel> => {
    const result = await DB.getInstance()
      .getDB()
      .get(`SELECT * FROM booking WHERE id = ?`, data.uuid);
    return BookingModel.fromPOJO(JSON.parse(result.data) as Booking);
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
