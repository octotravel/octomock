import { CapabilityId } from "../types/Capability";
import { CreateBookingSchema } from "../schemas/Booking";
import { Booking } from "../types/Booking";
import { BookingService } from "../services/BookingService";

interface IBookingController {
  createBooking(
    data: CreateBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking>;
}

export class BookingController implements IBookingController {
  private bookingService = new BookingService();
  public createBooking = async (
    data: CreateBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking> => {
    return this.bookingService.createBooking(data, capabilities);
  };
}
