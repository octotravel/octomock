import { ValidatedError } from "./../../../validators/backendValidator/Error/index";

export type ApiParams = {
  headers?: Record<string, string>;
};
export type Result<T> = {
  request: Nullable<ResultRequest>;
  response: Nullable<ResultResponse<T>>;
  data: Nullable<T>;
};

export type ResultRequest = {
  url: string;
  method: string;
  body: Nullable<Record<string, any>>;
  headers: Record<string, string>;
};
export type ResultResponse<T> = {
  data: Nullable<{
    status: number;
    body: T;
  }>;
  error: Nullable<ValidatedError>;
  headers: Record<string, string>;
};
