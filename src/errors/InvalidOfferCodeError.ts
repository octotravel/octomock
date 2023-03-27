import { OctoError } from "../models/Error";

export default class InvalidOfferCodeError extends OctoError {
  public readonly code: string;

  constructor(code: string) {
    super({
      status: 400,
      error: "INVALID_OFFER_CODE",
      errorMessage: "The offerCode is invalid",
      bodyParams: { code },
    });

    this.code = code;
  }
}
