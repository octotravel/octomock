import { ValidatedError } from "./index";
import { BAD_REQUEST, STATUS_BAD_REQUEST } from "../../../models/Error";
import {
  ModelValidator,
  NumberValidator,
  StringValidator,
  ValidatorError,
} from "../ValidatorHelpers";

export class BadRequestErrorValidator implements ModelValidator {
  public validate = (data: ValidatedError): ValidatorError[] => {
    return [
      StringValidator.validate(`error`, data?.body?.error, {
        equalsTo: BAD_REQUEST,
      }),
      StringValidator.validate(`errorMessage`, data?.body?.errorMessage),
      NumberValidator.validate(`status`, data?.status, {
        integer: true,
        equalsTo: STATUS_BAD_REQUEST,
      }),
    ].flatMap((v) => (v ? [v] : []));
  };
}
