import { ValidatedError } from "./index";
import { NumberValidator } from "./../ValidatorHelpers";
import {
  INVALID_BOOKING_UUID,
  STATUS_BAD_REQUEST,
} from "../../../models/Error";
import {
  ModelValidator,
  StringValidator,
  ValidatorError,
} from "../ValidatorHelpers";

export class InvalidBookingUUIDErrorValidator implements ModelValidator {
  public validate = (data: ValidatedError): ValidatorError[] => {
    return [
      StringValidator.validate(`error`, data?.body?.error, {
        equalsTo: INVALID_BOOKING_UUID,
      }),
      StringValidator.validate(`errorMessage`, data?.body?.errorMessage),
      StringValidator.validate(`uuid`, data?.body?.uuid),
      NumberValidator.validate(`status`, data?.status, {
        integer: true,
        equalsTo: STATUS_BAD_REQUEST,
      }),
    ].flatMap((v) => (v ? [v] : []));
  };
}
