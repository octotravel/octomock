import { BookingModel, BookingParser } from '@octocloud/generators';
import { Booking } from '@octocloud/types';
import { DateHelper } from '../helpers/DateFormatter';
import { InvalidBookingUUIDError } from '../models/Error';
import { GetBookingSchema, GetBookingsSchema } from '../schemas/Booking';
import { DB } from '../storage/Database';

interface IBookingRepository {
  createBooking: (bookingModel: BookingModel) => Promise<BookingModel>;
  updateBooking: (bookingModel: BookingModel) => Promise<BookingModel>;
  getBooking: (bookingModel: BookingModel) => Promise<BookingModel>;
  getBookings: (schema: GetBookingsSchema) => Promise<BookingModel[]>;
}

export class BookingRepository implements IBookingRepository {
  private readonly bookingParser = new BookingParser();

  public createBooking = async (bookingModel: BookingModel): Promise<BookingModel> => {
    const db = await DB.getInstance().getDB();

    db.prepare(
      `
    INSERT INTO booking (
      id,
      status,
      resellerReference,
      supplierReference,
      createdAt,
      data
    ) VALUES (?, ?, ?, ?, ?, ?)
  `,
    ).run(
      bookingModel.uuid,
      bookingModel.status,
      bookingModel.resellerReference,
      bookingModel.supplierReference,
      DateHelper.getDate(bookingModel.utcCreatedAt),
      JSON.stringify(this.bookingParser.parseModelToPOJO(bookingModel)),
    );

    return bookingModel;
  };

  public updateBooking = async (bookingModel: BookingModel): Promise<BookingModel> => {
    const db = await DB.getInstance().getDB();

    db.prepare(
      `
    UPDATE booking
      SET status = ?,
          resellerReference = ?,
          data = ?
      WHERE id = ?
  `,
    ).run(
      bookingModel.status,
      bookingModel.resellerReference,
      JSON.stringify(this.bookingParser.parseModelToPOJO(bookingModel)),
      bookingModel.uuid,
    );

    return bookingModel;
  };

  public getBooking = async (data: GetBookingSchema): Promise<BookingModel> => await this.getBookingByUuid(data.uuid);

  public getBookingByUuid = async (uuid: string): Promise<BookingModel> => {
    const db = await DB.getInstance().getDB();
    // biome-ignore lint/suspicious/noExplicitAny: ignored
    const result: any = (await db.prepare('SELECT * FROM booking WHERE id = ?').get(uuid)) ?? null;

    if (result == null) {
      throw new InvalidBookingUUIDError(uuid);
    }

    const booking = JSON.parse(result.data) as Booking;
    const bookingModel = this.bookingParser.parsePOJOToModel(booking);
    this.handleExpiredBooking(bookingModel);

    return bookingModel;
  };

  private readonly handleExpiredBooking = (booking: BookingModel): void => {
    const isExpired = booking.utcExpiresAt! < DateHelper.utcDateFormat(new Date());
    if (isExpired) {
      throw new InvalidBookingUUIDError(booking.uuid);
    }
  };

  public getBookings = async (data: GetBookingsSchema): Promise<BookingModel[]> => {
    const db = await DB.getInstance().getDB();

    const selectQuery = 'SELECT * FROM booking WHERE ';
    const query: string[] = [];
    const params: unknown[] = [];

    if (data.resellerReference) {
      query.push('resellerReference = ?');
      params.push(data.resellerReference);
    }
    if (data.supplierReference) {
      query.push('supplierReference = ?');
      params.push(data.supplierReference);
    }

    if (data.localDateStart && data.localDateEnd) {
      query.push('createdAt BETWEEN ? AND ?');
      params.push(data.localDateStart);
      params.push(data.localDateEnd);
    } else if (data.localDate) {
      query.push('createdAt = ?');
      params.push(data.localDate);
    }

    const fullQuery = selectQuery + query.join(' AND ');

    const result = db.prepare(fullQuery).all(...params);

    // biome-ignore lint/suspicious/noExplicitAny: ignored
    return result.map((r: any) => this.bookingParser.parsePOJOToModel(JSON.parse(r.data) as Booking));
  };
}
