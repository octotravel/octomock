import { Availability, Product } from "@octocloud/types";

export interface Scenario<T> {
  validate: () => Promise<ScenarioResult<T>>;
}

export interface ScenarioRequest {
  url: string;
  body: Nullable<any>;
}

export interface ScenarioResponse<T> {
  body: Nullable<T>;
  status: Nullable<number>;
  error: Nullable<{
    body: any;
  }>;
}

export interface ScenarioResult<T> {
  name: string;
  success: boolean;
  request: ScenarioRequest;
  response: ScenarioResponse<T>;
  errors: any[]; // validation errors
}

export interface BookingValidateData {
  productId: string;
  optionId: string;
  availability: Availability[];
  product: Product;
  availabilityTo?: Availability[];
  availabilityFrom?: Availability[];
}
