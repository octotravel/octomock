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

export type Result<T> = {
  request: ResultRequest<T>;
  response: ResultResponse<T>;
};

export type ResultRequest<T> = {
  url: string;
  body: Nullable<T>;
};

export type ResultResponse<T> = {
  data: Nullable<{
    status: number;
    body: T;
  }>;
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
    return await this.setResponse({ url, body: null }, response);
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
    return await this.setResponse({ url, body: null }, response);
  };

  public getProducts = async (_?: ApiParams): Promise<Result<Product[]>> => {
    const url = `${this.url}/products`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...this.mapCapabilities(),
      },
    });
    return await this.setResponse({ url, body: null }, response);
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
    return await this.setResponse({ url, body: null }, response);
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
    return await this.setResponse({ url, body }, response);
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
    return await this.setResponse({ url, body }, response);
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
    return await this.setResponse({ url, body }, response);
  };

  public bookingConfirmation = async (
    data: ConfirmBookingBodySchema & ConfirmBookingPathParamsSchema,
    _?: ApiParams
  ): Promise<Result<Booking>> => {
    const url = `${this.url}/bookings/${data.uuid}/confirm`;
    delete data.uuid;
    const body = JSON.stringify(data);
    const response = await fetch(url, {
      method: "POST",
      body,
      headers: {
        ...this.mapCapabilities(),
      },
    });
    return await this.setResponse({ url, body }, response);
  };

  public getBookings = async (
    data: GetBookingsQueryParamsSchema,
    _?: ApiParams
  ): Promise<Result<Booking[]>> => {
    const params = new URLSearchParams(data);
    const url = `${this.url}/bookings?` + params;
    const response = await fetch(url, {
      method: "GET",

      headers: {
        ...this.mapCapabilities(),
      },
    });
    return await this.setResponse({ url, body: null }, response);
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
    return await this.setResponse({ url, body: null }, response);
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
    return await this.setResponse({ url, body }, response);
  };

  private setResponse = async <T>(
    request: { url: string; body: Nullable<any> },
    response: Response
  ): Promise<Result<T>> => {
    const data = await response.json();
    const status = response.status;

    if (status === 200) {
      return {
        request: {
          url: request.url,
          body: JSON.parse(request.body),
        },
        response: {
          data: {
            status,
            body: data as T,
          },
          error: null,
        },
      };
    }
    return {
      request: {
        url: request.url,
        body: JSON.parse(request.body),
      },
      response: {
        data: null,
        error: {
          status: response.status,
          body: data,
        },
      },
    };
  };

  private mapCapabilities = (): Record<string, string> => {
    return { "Octo-Capabilities": this.capabilities.join(", ") };
  };
}
