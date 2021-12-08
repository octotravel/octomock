import { GetBookingSchema, GetBookingsSchema } from "./../schemas/Booking";
import { DataGenerator } from "./../generators/DataGenerator";
import { AvailabilityService } from "./../services/AvailabilityService";
import { ProductService } from "./../services/ProductService";
import { CapabilityId } from "../types/Capability";
import { CreateBookingSchema } from "../schemas/Booking";
import { Booking, BookingStatus } from "../types/Booking";
import { BookingService } from "../services/BookingService";
import { BookingBuilder } from "../builders/BookingBuilder";

interface IBookingController {
  createBooking(
    data: CreateBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking>;
  getBooking(
    data: GetBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking>;
  getBookings(
    data: GetBookingsSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking[]>;
}

export class BookingController implements IBookingController {
  private bookingService = new BookingService();
  private productService = new ProductService();
  private availabilityService = new AvailabilityService();
  private bookingBuilder = new BookingBuilder();

  public createBooking = async (
    data: CreateBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking> => {
    const product = this.productService.getProduct(
      data.productId,
    );
    const availability = await this.availabilityService.findBookingAvailability(
      {
        product,
        optionId: data.optionId,
        availabilityId: data.availabilityId,
      },
      capabilities
    );

    // build booking here
    const bookingModel = this.bookingBuilder.build({
      id: DataGenerator.generateUUID(),
      uuid: data.uuid ?? DataGenerator.generateUUID(),
      resellerReference: data.resellerReference ?? null,
      supplierReference: DataGenerator.generateSupplierReference(),
      status: BookingStatus.ON_HOLD,
      utcCreatedAt: "",
      utcUpdatedAt: null,
      utcExpiresAt: null,
      utcRedeemedAt: null,
      utcConfirmedAt: null,
      product,
      option: product.getOption(data.optionId),
      availability: {
        id: availability.id,
        localDateTimeStart: availability.localDateTimeStart,
        localDateTimeEnd: availability.localDateTimeEnd,
        allDay: availability.allDay,
        openingHours: availability.openingHours,
      },
      contact: {
        fullName: null,
        firstName: null,
        lastName: null,
        emailAddress: null,
        phoneNumber: null,
        locales: [],
        country: null,
        notes: null,
      },
      unitItems: data.unitItems,
      capabilities,
    });

    const createdBookingModel = await this.bookingService.createBooking(
      bookingModel,
      capabilities
    );
    return createdBookingModel.toPOJO();
  };

  public getBooking = async (
    data: GetBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking> => {
    const booking = await this.bookingService.getBooking(data, capabilities);
    return booking.toPOJO();
  };

  public getBookings = async (
    data: GetBookingsSchema,
    _: CapabilityId[]
  ): Promise<Booking[]> => {
    const bookings = await this.bookingService.getBookings(data);
    return bookings.map((b) => b.toPOJO());
  };
}
