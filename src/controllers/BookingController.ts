import { CancelBookingSchema, ConfirmBookingSchema, ExtendBookingSchema, GetBookingSchema, GetBookingsSchema, UpdateBookingSchema } from "./../schemas/Booking";
import { AvailabilityService } from "./../services/AvailabilityService";
import { ProductService } from "./../services/ProductService";
import { CapabilityId } from "../types/Capability";
import { CreateBookingSchema } from "../schemas/Booking";
import { Booking, BookingStatus } from "../types/Booking";
import { BookingService } from "../services/BookingService";
import { BookingBuilder } from "../builders/BookingBuilder";

interface IBookingController {
  createBooking(
    schema: CreateBookingSchema,
    capabilities: CapabilityId[],
  ): Promise<Booking>;
  confirmBooking(
    schema: ConfirmBookingSchema,
  ): Promise<Booking>;
  confirmBooking(
    schema: UpdateBookingSchema,
  ): Promise<Booking>;
  extendBooking(
    schema: ExtendBookingSchema,
  ): Promise<Booking>;
  cancelBooking(
    schema: CancelBookingSchema,
  ): Promise<Booking>;
  getBooking(
    schema: GetBookingSchema,
  ): Promise<Booking>;
  getBookings(
    schema: GetBookingsSchema,
  ): Promise<Booking[]>;
}

export class BookingController implements IBookingController {
  private bookingService = new BookingService();
  private productService = new ProductService();
  private availabilityService = new AvailabilityService();
  private bookingBuilder = new BookingBuilder();

  public createBooking = async (
    schema: CreateBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking> => {
    const product = this.productService.getProduct(
      schema.productId,
    );
    const availability = await this.availabilityService.findBookingAvailability(
      {
        product,
        optionId: schema.optionId,
        availabilityId: schema.availabilityId,
      },
      capabilities
    );

    const bookingModel = this.bookingBuilder.createBooking({
      product,
      availability: {
        id: availability.id,
        localDateTimeStart: availability.localDateTimeStart,
        localDateTimeEnd: availability.localDateTimeEnd,
        allDay: availability.allDay,
        openingHours: availability.openingHours,
      },
    }, schema);

    const createdBookingModel = await this.bookingService.createBooking(
      bookingModel,
    );
    return createdBookingModel.toPOJO();
  };

  public confirmBooking = async (
    schema: ConfirmBookingSchema,
  ): Promise<Booking> => {
    const booking = await this.bookingService.getBooking(schema);
    if (booking.status === BookingStatus.CONFIRMED) {
      return booking.toPOJO()
    }
    const confirmedBooking = this.bookingBuilder.confirmBooking(booking, schema)
    const bookingModel = await this.bookingService.updateBooking(confirmedBooking);
    return bookingModel.toPOJO()
  }

  public updateBooking = async (
    schema: UpdateBookingSchema,
  ): Promise<Booking> => {
    const booking = await this.bookingService.getBooking(schema);
    if (booking.cancellable === false) {
      throw new Error('booking cannot be updated')
    }
    const confirmedBooking = this.bookingBuilder.updateBooking(booking, schema)
    const bookingModel = await this.bookingService.updateBooking(confirmedBooking);
    return bookingModel.toPOJO()
  }

  public extendBooking = async (
    schema: ExtendBookingSchema,
  ): Promise<Booking> => {
    const booking = await this.bookingService.getBooking(schema);
    if (booking.status !== BookingStatus.ON_HOLD) {
      throw new Error('booking cannot be extended');
    }
    const extendedBooking = this.bookingBuilder.extendBooking(booking, schema)
    const bookingModel = await this.bookingService.updateBooking(extendedBooking);
    return bookingModel.toPOJO()
  }

  public cancelBooking = async (
    schema: ConfirmBookingSchema,
  ): Promise<Booking> => {
    const booking = await this.bookingService.getBooking(schema);
    if (booking.cancellable === false) {
      throw new Error('booking not cancellable')
    }
    if (booking.status === BookingStatus.CANCELLED) {
      return booking.toPOJO()
    }
    const cancelledBooking = this.bookingBuilder.cancelBooking(booking, schema)
    const bookingModel = await this.bookingService.updateBooking(cancelledBooking);
    return bookingModel.toPOJO()
  }

  public getBooking = async (
    schema: GetBookingSchema,
  ): Promise<Booking> => {
    const bookingModel = await this.bookingService.getBooking(schema);
    return bookingModel.toPOJO();
  };

  public getBookings = async (
    schema: GetBookingsSchema,
  ): Promise<Booking[]> => {
    const bookingModels = await this.bookingService.getBookings(schema);
    return bookingModels.map((b) => b.toPOJO());
  };
}
