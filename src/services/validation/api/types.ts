import { ValidatedError } from "./../../../validators/backendValidator/Error/index";

export type ApiParams = {
  headers?: Record<string, string>;
};
export type Result<T> = {
  request: ResultRequest;
  response: ResultResponse<T>;
  data: Nullable<T>;
};

export type ResultRequest = {
  url: string;
  body: Nullable<Record<string, any>>;
};
export type ResultResponse<T> = {
  data: Nullable<{
    status: number;
    body: T;
  }>;
  error: Nullable<ValidatedError>;
};
