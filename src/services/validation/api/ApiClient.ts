import {
  Availability,
  AvailabilityBodySchema,
  AvailabilityCalendar,
  AvailabilityCalendarBodySchema,
  Booking,
  CancelBookingBodySchema,
  CancelBookingPathParamsSchema,
  Capability,
  CapabilityId,
  ConfirmBookingBodySchema,
  ConfirmBookingPathParamsSchema,
  ExtendBookingBodySchema,
  ExtendBookingPathParamsSchema,
  GetBookingPathParamsSchema,
  GetBookingsQueryParamsSchema,
  GetProductPathParamsSchema,
  Product,
  Supplier,
  UpdateBookingBodySchema,
  UpdateBookingPathParamsSchema,
} from "@octocloud/types";
import { CreateBookingSchema } from "../../../schemas/Booking";
import { Client } from "./Client";
import { Result } from "./types";

export class ApiClient extends Client {
  private url: string;
  constructor(data: { capabilities?: CapabilityId[]; url: string; apiKey: string }) {
    super(data);
    this.url = data.url;
  }

  public getCapabilities = async (): Promise<Result<Capability[]>> => {
    const url = `${this.url}/capabilities`;

    return this.fetch({ url });
  };

  public getSupplier = async (): Promise<Result<Supplier>> => {
    const url = `${this.url}/supplier`;
    return this.fetch({ url });
  };

  public getProducts = async (): Promise<Result<Product[]>> => {
    const url = `${this.url}/products`;
    return this.fetch({ url });
  };

  public getProduct = async (data: GetProductPathParamsSchema): Promise<Result<Product>> => {
    const url = `${this.url}/products/${data.id}`;
    return this.fetch({ url });
  };

  public getAvailability = async (
    data: AvailabilityBodySchema
  ): Promise<Result<Availability[]>> => {
    const url = `${this.url}/availability`;
    const body = JSON.stringify(data);
    return this.fetch({ url, body, method: "POST" });
  };

  public getAvailabilityCalendar = async (
    data: AvailabilityCalendarBodySchema
  ): Promise<Result<AvailabilityCalendar[]>> => {
    const url = `${this.url}/availability/calendar`;
    const body = JSON.stringify(data);
    return this.fetch({ url, body, method: "POST" });
  };

  public bookingReservation = async (data: CreateBookingSchema): Promise<Result<Booking>> => {
    const url = `${this.url}/bookings`;
    const body = JSON.stringify(data);
    return this.fetch({ url, body, method: "POST" });
  };

  public bookingConfirmation = async (
    data: ConfirmBookingBodySchema & ConfirmBookingPathParamsSchema
  ): Promise<Result<Booking>> => {
    const url = `${this.url}/bookings/${data.uuid}/confirm`;
    delete data.uuid;
    const body = JSON.stringify(data);
    return this.fetch({ url, body, method: "POST" });
  };

  public getBookings = async (data: GetBookingsQueryParamsSchema): Promise<Result<Booking[]>> => {
    const params = new URLSearchParams(data);
    const url = `${this.url}/bookings?` + params;
    return this.fetch({ url });
  };

  public getBooking = async (data: GetBookingPathParamsSchema): Promise<Result<Booking>> => {
    const url = `${this.url}/bookings/${data.uuid}`;
    return this.fetch({ url });
  };

  public cancelBooking = async (
    data: CancelBookingBodySchema & CancelBookingPathParamsSchema
  ): Promise<Result<Booking>> => {
    const url = `${this.url}/bookings/${data.uuid}`;
    delete data.uuid;
    const body = JSON.stringify(data);
    return this.fetch({ url, body, method: "DELETE" });
  };

  public bookingExtend = async (
    data: ExtendBookingBodySchema & ExtendBookingPathParamsSchema
  ): Promise<Result<Booking>> => {
    const url = `${this.url}/bookings/${data.uuid}/extend`;
    delete data.uuid;
    const body = JSON.stringify(data);
    return this.fetch({ url, body, method: "POST" });
  };

  public bookingUpdate = async (
    data: UpdateBookingBodySchema & UpdateBookingPathParamsSchema
  ): Promise<Result<Booking>> => {
    const url = `${this.url}/bookings/${data.uuid}`;
    delete data.uuid;
    const body = JSON.stringify(data);
    return this.fetch({ url, body, method: "PATCH" });
  };
}
