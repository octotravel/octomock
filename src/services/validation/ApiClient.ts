import { Availability, AvailabilityBodySchema, Booking, CancelBookingBodySchema, CancelBookingPathParamsSchema, CapabilityId, ConfirmBookingBodySchema, ConfirmBookingPathParamsSchema, GetBookingPathParamsSchema, GetProductPathParamsSchema, GetSupplierPathParamsSchema, Product, Supplier } from "@octocloud/types";
import "isomorphic-fetch";
import { CreateBookingSchema } from "../../schemas/Booking";

export type ApiParams = {
  capabilities?: CapabilityId[];
  headers?: any;
  url: string;
};

type Result<T> = {
  result: Nullable<T>;
  error: Nullable<Error>;
};

export class ApiClient {
  public getSuppliers = async (params: ApiParams): Promise<Result<Supplier[]>> => {
    const url = `${params.url}/suppliers`;
    const response = await fetch(url, {
      method: "GET",
      headers: params.headers,
    });

    if (response.status === 200) {
      return {
        result: await response.json(),
        error: null,
      };
    }
    return {
      result: null,
      error: await response.json(),
    };
  };

  public getSupplier = async (data: GetSupplierPathParamsSchema, params: ApiParams): Promise<Result<Supplier>> => {
    const url = `${params.url}/suppliers/${data.id}`;
    const response = await fetch(url, {
      method: "GET",
      headers: params.headers,
    });
    if (response.status === 200) {
      return {
        result: await response.json(),
        error: null,
      };
    }
    return {
      result: null,
      error: await response.json(),
    };
  };

  public getProducts = async (params: ApiParams): Promise<Result<Product[]>> => {
    const url = `${params.url}/products`;
    const response = await fetch(url, {
      method: "GET",
      headers: params.headers,
    });

    if (response.status === 200) {
      return {
        result: await response.json(),
        error: null,
      };
    }
    return {
      result: null,
      error: await response.json(),
    };
  };

  public getProduct = async (data: GetProductPathParamsSchema, params: ApiParams): Promise<Result<Product>> => {
    const url = `${params.url}/products/${data.id}`;
    const response = await fetch(url, {
      method: "GET",
      headers: params.headers,
    });

    if (response.status === 200) {
      return {
        result: await response.json(),
        error: null,
      };
    }
    return {
      result: null,
      error: await response.json(),
    };
  };

  public getAvailability = async (data: AvailabilityBodySchema, params: ApiParams): Promise<Result<Availability[]>> => {
    const url = `${params.url}/availability`;
    const body = JSON.stringify(data);
    const response = await fetch(url, {
      method: "POST",
      headers: params.headers,
      body,
    });
    if (response.status === 200) {
      return {
        result: await response.json(),
        error: null,
      };
    }
    return {
      result: null,
      error: await response.json(),
    };
  };

  public bookingReservation = async (data: CreateBookingSchema, params: ApiParams): Promise<Result<Booking>> => {
    const url = `${params.url}/bookings`;
    const body = JSON.stringify(data);
    const response = await fetch(url, {
      method: "POST",
      headers: params.headers,
      body,
    });
    if (response.status === 200) {
      return {
        result: await response.json(),
        error: null,
      };
    }
    return {
      result: null,
      error: await response.json(),
    };
  };

  public bookingConfirmation = async (urlParams: ConfirmBookingPathParamsSchema, data: ConfirmBookingBodySchema, params: ApiParams): Promise<Result<Booking>> => {
    const url = `${params.url}/bookings/${urlParams.uuid}/confirm`;
    const body = JSON.stringify(data);
    const response = await fetch(url, {
      method: "POST",
      headers: params.headers,
      body,
    });
    if (response.status === 200) {
      return {
        result: await response.json(),
        error: null,
      };
    }
    return {
      result: null,
      error: await response.json(),
    };
  };

  public getBooking = async (data: GetBookingPathParamsSchema, params: ApiParams): Promise<Result<Booking>> => {
    const url = `${params.url}/bookings/${data.uuid}`;
    const response = await fetch(url, {
      method: "GET",
      headers: params.headers,
    });
    if (response.status === 200) {
      return {
        result: await response.json(),
        error: null,
      };
    }
    return {
      result: null,
      error: await response.json(),
    };
  };

  public cancelBooking = async (urlParams: CancelBookingPathParamsSchema, data: CancelBookingBodySchema, params: ApiParams): Promise<Result<Booking>> => {
    const url = `${params.url}/bookings/${urlParams.uuid}`;
    const body = JSON.stringify(data);
    const response = await fetch(url, {
      method: "DELETE",
      headers: params.headers,
      body,
    });
    if (response.status === 200) {
      return {
        result: await response.json(),
        error: null,
      };
    }
    return {
      result: null,
      error: await response.json(),
    };
  };
}
