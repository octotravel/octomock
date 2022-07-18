// import { BookingValidator } from "./../validators/backendValidator/BookingValidator";
import { CapabilityId, Booking, BookingStatus } from "@octocloud/types";
import { UnprocessableEntityError } from "./../models/Error";
import {
  CancelBookingSchema,
  ConfirmBookingSchema,
  ExtendBookingSchema,
  GetBookingSchema,
  GetBookingsSchema,
  UpdateBookingSchema,
  CreateBookingSchema,
} from "./../schemas/Booking";
import { AvailabilityService } from "./../services/AvailabilityService";
import { ProductService } from "./../services/ProductService";
import { BookingService } from "../services/BookingService";
import { BookingBuilder } from "../builders/BookingBuilder";

interface IBookingController {
  createBooking(
    schema: CreateBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking>;
  confirmBooking(
    schema: ConfirmBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking>;
  updateBooking(
    schema: UpdateBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking>;
  extendBooking(
    schema: ExtendBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking>;
  cancelBooking(
    schema: CancelBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking>;
  getBooking(
    schema: GetBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking>;
  getBookings(
    schema: GetBookingsSchema,
    capabilities: CapabilityId[]
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
    const product = this.productService.getProduct(schema.productId);
    const availability = await this.availabilityService.findBookingAvailability(
      {
        product,
        optionId: schema.optionId,
        availabilityId: schema.availabilityId,
      },
      capabilities
    );
    const option = product.getOption(schema.optionId);
    if (option.restrictions.minUnits > schema.unitItems.length) {
      throw new UnprocessableEntityError("minimal restrictions not met");
    }

    const bookingModel = this.bookingBuilder.createBooking(
      {
        product,
        availability: {
          id: availability.id,
          localDateTimeStart: availability.localDateTimeStart,
          localDateTimeEnd: availability.localDateTimeEnd,
          allDay: availability.allDay,
          openingHours: availability.openingHours,
        },
      },
      schema
    );

    // new BookingValidator(capabilities).validate(bookingModel.toPOJO({}));

    const createdBookingModel = await this.bookingService.createBooking(
      bookingModel
    );
    return createdBookingModel.toPOJO({ useCapabilities: true, capabilities });
  };

  public confirmBooking = async (
    schema: ConfirmBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking> => {
    const booking = await this.bookingService.getBooking(schema);
    if (booking.status === BookingStatus.CONFIRMED) {
      return booking.toPOJO({ useCapabilities: true, capabilities });
    }
    const confirmedBooking = this.bookingBuilder.confirmBooking(
      booking,
      schema
    );
    const bookingModel = await this.bookingService.updateBooking(
      confirmedBooking
    );
    return bookingModel.toPOJO({ useCapabilities: true, capabilities });
  };

  public updateBooking = async (
    schema: UpdateBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking> => {
    const booking = await this.bookingService.getBooking(schema);
    if (booking.cancellable === false) {
      throw new UnprocessableEntityError("booking cannot be updated");
    }
    const confirmedBooking = this.bookingBuilder.updateBooking(booking, schema);
    const bookingModel = await this.bookingService.updateBooking(
      confirmedBooking
    );
    return bookingModel.toPOJO({ useCapabilities: true, capabilities });
  };

  public extendBooking = async (
    schema: ExtendBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking> => {
    const booking = await this.bookingService.getBooking(schema);
    if (booking.status !== BookingStatus.ON_HOLD) {
      throw new UnprocessableEntityError("booking cannot be extended");
    }
    const extendedBooking = this.bookingBuilder.extendBooking(booking, schema);
    const bookingModel = await this.bookingService.updateBooking(
      extendedBooking
    );
    return bookingModel.toPOJO({ useCapabilities: true, capabilities });
  };

  public cancelBooking = async (
    schema: CancelBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking> => {
    const booking = await this.bookingService.getBooking(schema);
    if (booking.cancellable === false) {
      throw new UnprocessableEntityError("booking not cancellable");
    }
    if (booking.status === BookingStatus.CANCELLED) {
      return booking.toPOJO({ useCapabilities: true, capabilities });
    }
    const cancelledBooking = this.bookingBuilder.cancelBooking(booking, schema);
    const bookingModel = await this.bookingService.updateBooking(
      cancelledBooking
    );
    return bookingModel.toPOJO({ useCapabilities: true, capabilities });
  };

  public getBooking = async (
    schema: GetBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking> => {
    const bookingModel = await this.bookingService.getBooking(schema);
    return bookingModel.toPOJO({ useCapabilities: true, capabilities });
  };

  public getBookings = async (
    schema: GetBookingsSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking[]> => {
    const bookingModels = await this.bookingService.getBookings(schema);
    return bookingModels.map((b) =>
      b.toPOJO({ useCapabilities: true, capabilities })
    );
  };
}
