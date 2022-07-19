import { ValidatedError } from "../../validators/backendValidator/Error/index";
import {
  Availability,
  AvailabilityBodySchema,
  AvailabilityCalendar,
  AvailabilityCalendarBodySchema,
  Booking,
  CancelBookingBodySchema,
  CancelBookingPathParamsSchema,
  CapabilityId,
  ConfirmBookingBodySchema,
  ConfirmBookingPathParamsSchema,
  GetBookingPathParamsSchema,
  GetBookingsQueryParamsSchema,
  GetProductPathParamsSchema,
  GetSupplierPathParamsSchema,
  Product,
  Supplier,
} from "@octocloud/types";
import { CreateBookingSchema } from "../../schemas/Booking";

export type ApiParams = {
  headers?: Record<string, string>;
};

type Result<T> = {
  result: Nullable<T>;
  error: Nullable<ValidatedError>;
};

export class ApiClient {
  private capabilities: CapabilityId[];
  private url: string;
  constructor({
    capabilities,
    url,
  }: {
    capabilities: CapabilityId[];
    url: string;
  }) {
    this.capabilities = capabilities;
    this.url = url;
  }
  public getSuppliers = async (_?: ApiParams): Promise<Result<Supplier[]>> => {
    const url = `${this.url}/suppliers`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...this.mapCapabilities(),
      },
    });
    return await this.setResponse(response);
  };

  public getSupplier = async (
    data: GetSupplierPathParamsSchema,
    _?: ApiParams
  ): Promise<Result<Supplier>> => {
    const url = `${this.url}/suppliers/${data.id}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...this.mapCapabilities(),
      },
    });
    return await this.setResponse(response);
  };

  public getProducts = async (_?: ApiParams): Promise<Result<Product[]>> => {
    const url = `${this.url}/products`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...this.mapCapabilities(),
      },
    });
    return await this.setResponse(response);
  };

  public getProduct = async (
    data: GetProductPathParamsSchema,
    _?: ApiParams
  ): Promise<Result<Product>> => {
    const url = `${this.url}/products/${data.id}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...this.mapCapabilities(),
      },
    });
    return await this.setResponse(response);
  };

  public getAvailability = async (
    data: AvailabilityBodySchema,
    _?: ApiParams
  ): Promise<Result<Availability[]>> => {
    const url = `${this.url}/availability`;
    const body = JSON.stringify(data);
    const response = await fetch(url, {
      method: "POST",
      body,
      headers: {
        ...this.mapCapabilities(),
      },
    });
    return await this.setResponse(response);
  };

  public getAvailabilityCalendar = async (
    data: AvailabilityCalendarBodySchema,
    _?: ApiParams
  ): Promise<Result<AvailabilityCalendar[]>> => {
    const url = `${this.url}/availability/calendar`;
    const body = JSON.stringify(data);
    const response = await fetch(url, {
      method: "POST",
      body,
      headers: {
        ...this.mapCapabilities(),
      },
    });
    return await this.setResponse(response);
  };

  public bookingReservation = async (
    data: CreateBookingSchema,
    _?: ApiParams
  ): Promise<Result<Booking>> => {
    const url = `${this.url}/bookings`;
    const body = JSON.stringify(data);
    const response = await fetch(url, {
      method: "POST",
      body,
      headers: {
        ...this.mapCapabilities(),
      },
    });
    return await this.setResponse(response);
  };

  public bookingConfirmation = async (
    data: ConfirmBookingBodySchema & ConfirmBookingPathParamsSchema,
    _?: ApiParams
  ): Promise<Result<Booking>> => {
    const url = `${this.url}/bookings/${data.uuid}/confirm`;
    const body = JSON.stringify({
      contact: data.contact,
    });
    const response = await fetch(url, {
      method: "POST",
      body,
      headers: {
        ...this.mapCapabilities(),
      },
    });
    return await this.setResponse(response);
  };

  public getBookings = async (
    data: GetBookingsQueryParamsSchema,
    _?: ApiParams
  ): Promise<Result<Booking[]>> => {
    const url = `${this.url}/bookings`;
    const body = JSON.stringify(data);
    const response = await fetch(url, {
      method: "GET",
      body,
      headers: {
        ...this.mapCapabilities(),
      },
    });
    return await this.setResponse(response);
  };

  public getBooking = async (
    data: GetBookingPathParamsSchema,
    _?: ApiParams
  ): Promise<Result<Booking>> => {
    const url = `${this.url}/bookings/${data.uuid}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...this.mapCapabilities(),
      },
    });
    return await this.setResponse(response);
  };

  public cancelBooking = async (
    data: CancelBookingBodySchema & CancelBookingPathParamsSchema,
    _?: ApiParams
  ): Promise<Result<Booking>> => {
    const url = `${this.url}/bookings/${data.uuid}`;
    const body = JSON.stringify(data);
    const response = await fetch(url, {
      method: "DELETE",
      body,
      headers: {
        ...this.mapCapabilities(),
      },
    });
    return await this.setResponse(response);
  };

  private setResponse = async <T>(response: Response): Promise<Result<T>> => {
    const data = await response.json();
    const status = response.status;

    if (status === 200) {
      return {
        result: data as T,
        error: null,
      };
    }
    return {
      result: null,
      error: {
        status,
        body: data,
      },
    };
  };

  private mapCapabilities = (): Record<string, string> => {
    if (this.capabilities.length > 0) {
      return {
        "Octo-Capabilities": this.capabilities.join(", "),
      };
    }
    return { "Octo-Capabilities": this.capabilities.join(", ") };
  };
}
