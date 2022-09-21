// const STATUS_SUCCESS = 200;
export const STATUS_BAD_REQUEST = 400;
// const STATUS_UNAUTHORIZED = 401;
// const STATUS_FORBIDDEN = 403;
export const STATUS_NOT_FOUND = 404;
const STATUS_INTERNAL_SERVER_ERROR = 500;
// const MESSAGE_BAD_REQUEST = "Bad Request";
// const MESSAGE_UNAUTHORIZED = "Unauthorized";
// const MESSAGE_INTERNAL_SERVER_ERROR = "Internal Server Error";

export const INVALID_PRODUCT_ID = "INVALID_PRODUCT_ID";
export const INVALID_OPTION_ID = "INVALID_OPTION_ID";
export const INVALID_UNIT_ID = "INVALID_UNIT_ID";
export const INVALID_AVAILABILITY_ID = "INVALID_AVAILABILITY_ID";
export const INVALID_BOOKING_UUID = "INVALID_BOOKING_UUID";
export const BAD_REQUEST = "BAD_REQUEST";
export const UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY";
export const INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";
export const UNAUTHORIZED = "UNAUTHORIZED";
export const FORBIDDEN = "FORBIDDEN";
export const NOT_FOUND = "NOT_FOUND";

const ERROR_MESSAGE_INVALID_PRODUCT_ID = `The productId was missing or invalid'`;
const ERROR_MESSAGE_INVALID_OPTION_ID = `The optionId was missing or invalid'`;
const ERROR_MESSAGE_INVALID_UNIT_ID = `The unitId was missing or invalid`;
const ERROR_MESSAGE_INVALID_AVAILABILITY_ID = `The availabilityId was missing or invalid`;
const ERROR_MESSAGE_INVALID_BOOKING_UUID = `The uuid was already used, missing or invalid`;
const ERROR_MESSAGE_BAD_REQUEST = `The request body is not formatted correctly, you have missing required fields or any of the data types are incorrect`;
const ERROR_MESSAGE_UNPROCESSABLE_ENTITY = `The request body is technically correct but cannot be processed for other reasons. e.g. you tried to cancel a booking after the cancellation cutoff had elapsed`;
const ERROR_MESSAGE_INTERNAL_SERVER_ERROR = `There was an un-recoverable error, please try again`;
const ERROR_MESSAGE_UNAUTHORIZED = `You didn't send the API Key in the Authorization header to an endpoint that requires authentication`;
const ERROR_MESSAGE_FORBIDDEN = `You sent an API Key that was invalid or has been revoked by the backend system. Or you're trying to access an endpoint/resource that you do not have access to`;
const ERROR_MESSAGE_NOT_FOUND = "Resource not found";

interface HttpErrorParams {
  status: number;
  error: string;
  errorMessage: string;
  bodyParams?: Record<string, unknown>;
}

export class HttpError extends Error {
  public status: number;
  public error: string;
  public errorMessage: string;
  public body: Record<string, unknown> = {};
  constructor({
    status,
    error,
    errorMessage,
    bodyParams = {},
  }: HttpErrorParams) {
    super();
    this.status = status;
    this.error = error;
    this.errorMessage = errorMessage;
    this.body = {
      error,
      errorMessage,
      ...bodyParams,
    };
  }
}
export class OctoError extends HttpError {}

export class InvalidProductIdError extends OctoError {
  public productId: string;
  constructor(productId: string) {
    super({
      status: STATUS_BAD_REQUEST,
      error: INVALID_PRODUCT_ID,
      errorMessage: ERROR_MESSAGE_INVALID_PRODUCT_ID,
      bodyParams: { productId },
    });
    this.productId = productId;
  }
}

export class InvalidOptionIdError extends OctoError {
  public optionId: string;
  constructor(optionId: string) {
    super({
      status: STATUS_BAD_REQUEST,
      error: INVALID_OPTION_ID,
      errorMessage: ERROR_MESSAGE_INVALID_OPTION_ID,
      bodyParams: { optionId },
    });
    this.optionId = optionId;
  }
}

export class InvalidUnitIdError extends OctoError {
  public unitId: string;
  constructor(unitId: string) {
    super({
      status: STATUS_BAD_REQUEST,
      error: INVALID_UNIT_ID,
      errorMessage: ERROR_MESSAGE_INVALID_UNIT_ID,
      bodyParams: { unitId },
    });
    this.unitId = unitId;
  }
}

export class InvalidAvailabilityIdError extends OctoError {
  public availabilityId: string;
  constructor(availabilityId: string) {
    super({
      status: STATUS_BAD_REQUEST,
      error: INVALID_AVAILABILITY_ID,
      errorMessage: ERROR_MESSAGE_INVALID_AVAILABILITY_ID,
      bodyParams: { availabilityId },
    });
    this.availabilityId = availabilityId;
  }
}

export class InvalidBookingUUIDError extends OctoError {
  public uuid: string;
  constructor(uuid: string) {
    super({
      status: STATUS_BAD_REQUEST,
      error: INVALID_BOOKING_UUID,
      errorMessage: ERROR_MESSAGE_INVALID_BOOKING_UUID,
      bodyParams: { uuid },
    });
    this.uuid = uuid;
  }
}

export class BadRequestError extends OctoError {
  constructor(message?: string) {
    super({
      status: STATUS_BAD_REQUEST,
      error: BAD_REQUEST,
      errorMessage: message ?? ERROR_MESSAGE_BAD_REQUEST,
    });
  }
}

export class NotFoundError extends OctoError {
  constructor(message?: string) {
    super({
      status: STATUS_NOT_FOUND,
      error: NOT_FOUND,
      errorMessage: message ?? ERROR_MESSAGE_NOT_FOUND,
    });
  }
}

export class UnprocessableEntityError extends OctoError {
  constructor(message?: string) {
    super({
      status: STATUS_BAD_REQUEST,
      error: UNPROCESSABLE_ENTITY,
      errorMessage: message ?? ERROR_MESSAGE_UNPROCESSABLE_ENTITY,
    });
  }
}

export class InternalServerError extends OctoError {
  constructor(message?: string) {
    super({
      status: STATUS_INTERNAL_SERVER_ERROR,
      error: INTERNAL_SERVER_ERROR,
      errorMessage: message ?? ERROR_MESSAGE_INTERNAL_SERVER_ERROR,
    });
  }
}

export class UnauthorizedError extends OctoError {
  constructor() {
    super({
      status: STATUS_BAD_REQUEST,
      error: UNAUTHORIZED,
      errorMessage: ERROR_MESSAGE_UNAUTHORIZED,
    });
  }
}

export class OctoForbiddenError extends OctoError {
  constructor() {
    super({
      status: STATUS_BAD_REQUEST,
      error: FORBIDDEN,
      errorMessage: ERROR_MESSAGE_FORBIDDEN,
    });
  }
}
