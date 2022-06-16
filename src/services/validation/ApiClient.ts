import "isomorphic-fetch";
import { ValidatedError } from "./../../validators/backendValidator/Error/index";
import {
  Availability,
  AvailabilityBodySchema,
  Booking,
  CancelBookingBodySchema,
  CancelBookingPathParamsSchema,
  ConfirmBookingBodySchema,
  ConfirmBookingPathParamsSchema,
  GetBookingPathParamsSchema,
  GetProductPathParamsSchema,
  GetSupplierPathParamsSchema,
  Product,
  Supplier,
} from "@octocloud/types";
import { CreateBookingSchema } from "../../schemas/Booking";

export type ApiParams = {
  headers?: Record<string, string>;
  url: string;
};

type Result<T> = {
  result: Nullable<T>;
  error: Nullable<ValidatedError>;
};

export class ApiClient {
  public getSuppliers = async (
    params: ApiParams
  ): Promise<Result<Supplier[]>> => {
    const url = `${params.url}/suppliers`;
    const response = await fetch(url, {
      method: "GET",
      headers: params.headers,
    });
    return await this.setResponse(response);
  };

  public getSupplier = async (
    data: GetSupplierPathParamsSchema,
    params: ApiParams
  ): Promise<Result<Supplier>> => {
    const url = `${params.url}/suppliers/${data.id}`;
    const response = await fetch(url, {
      method: "GET",
      headers: params.headers,
    });
    return await this.setResponse(response);
  };

  public getProducts = async (
    params: ApiParams
  ): Promise<Result<Product[]>> => {
    const url = `${params.url}/products`;
    const response = await fetch(url, {
      method: "GET",
      headers: params.headers,
    });
    return await this.setResponse(response);
  };

  public getProduct = async (
    data: GetProductPathParamsSchema,
    params: ApiParams
  ): Promise<Result<Product>> => {
    const url = `${params.url}/products/${data.id}`;
    const response = await fetch(url, {
      method: "GET",
      headers: params.headers,
    });
    return await this.setResponse(response);
  };

  public getAvailability = async (
    data: AvailabilityBodySchema,
    params: ApiParams
  ): Promise<Result<Availability[]>> => {
    const url = `${params.url}/availability`;
    const body = JSON.stringify(data);
    const response = await fetch(url, {
      method: "POST",
      headers: params.headers,
      body,
    });
    return await this.setResponse(response);
  };

  public bookingReservation = async (
    data: CreateBookingSchema,
    params: ApiParams
  ): Promise<Result<Booking>> => {
    const url = `${params.url}/bookings`;
    const body = JSON.stringify(data);
    const response = await fetch(url, {
      method: "POST",
      headers: params.headers,
      body,
    });
    return await this.setResponse(response);
  };

  public bookingConfirmation = async (
    data: ConfirmBookingBodySchema & ConfirmBookingPathParamsSchema,
    params: ApiParams
  ): Promise<Result<Booking>> => {
    const url = `${params.url}/bookings/${data.uuid}/confirm`;
    const body = JSON.stringify(data);
    const response = await fetch(url, {
      method: "POST",
      headers: params.headers,
      body,
    });
    return await this.setResponse(response);
  };

  public getBooking = async (
    data: GetBookingPathParamsSchema,
    params: ApiParams
  ): Promise<Result<Booking>> => {
    const url = `${params.url}/bookings/${data.uuid}`;
    const response = await fetch(url, {
      method: "GET",
      headers: params.headers,
    });
    return await this.setResponse(response);
  };

  public cancelBooking = async (
    data: CancelBookingBodySchema & CancelBookingPathParamsSchema,
    params: ApiParams
  ): Promise<Result<Booking>> => {
    const url = `${params.url}/bookings/${data.uuid}`;
    const body = JSON.stringify(data);
    const response = await fetch(url, {
      method: "DELETE",
      headers: params.headers,
      body,
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
}
