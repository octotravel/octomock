import { ValidatedError } from "./index";
import { NumberValidator } from "./../ValidatorHelpers";
import {
  INVALID_AVAILABILITY_ID,
  STATUS_BAD_REQUEST,
} from "../../../models/Error";
import {
  ModelValidator,
  StringValidator,
  ValidatorError,
} from "../ValidatorHelpers";

export class InvalidAvailabilityIdErrorValidator implements ModelValidator {
  public validate = (data: ValidatedError): ValidatorError[] => {
    return [
      StringValidator.validate(`error`, data?.body?.error, {
        equalsTo: INVALID_AVAILABILITY_ID,
      }),
      StringValidator.validate(`errorMessage`, data?.body?.errorMessage),
      StringValidator.validate(`availabilityId`, data?.body?.availabilityId),
      NumberValidator.validate(`status`, data?.status, {
        integer: true,
        equalsTo: STATUS_BAD_REQUEST,
      }),
    ].flatMap((v) => (v ? [v] : []));
  };
}
