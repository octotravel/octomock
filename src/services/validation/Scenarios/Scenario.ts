import { Availability, Product } from "@octocloud/types";

export interface Scenario<T> {
  validate: () => Promise<ScenarioResult<T>>;
}

export interface ScenarioRequest {
  url: string;
  method: string;
  body: Nullable<any>;
  headers: Record<string, string>;
}

export interface ScenarioResponse<T> {
  body: Nullable<T>;
  status: Nullable<number>;
  error: Nullable<{
    body: any;
  }>;
  headers: Record<string, string>;
}

export enum ValidationResult {
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  FAILED = "FAILED",
}

export interface ScenarioResult<T> {
  name: string;
  success: boolean;
  validationResult: ValidationResult;
  request: Nullable<ScenarioRequest>;
  response: Nullable<ScenarioResponse<T>>;
  errors: any[]; // validation errors
  description: string;
}

export interface BookingValidateData {
  productId: string;
  optionId: string;
  availability: Availability[];
  product: Product;
  availabilityTo?: Availability[];
  availabilityFrom?: Availability[];
}
