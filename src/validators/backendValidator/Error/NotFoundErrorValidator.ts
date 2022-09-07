import { ValidatedError } from "./index";
import { NOT_FOUND, STATUS_NOT_FOUND } from "../../../models/Error";
import {
  ModelValidator,
  NumberValidator,
  StringValidator,
  ValidatorError,
} from "../ValidatorHelpers";

export class NotFoundErrorValidator implements ModelValidator {
  public validate = (data: ValidatedError): ValidatorError[] => {
    return [
      StringValidator.validate(`error`, data.body.error, {
        equalsTo: NOT_FOUND,
      }),
      StringValidator.validate(`errorMessage`, data.body.errorMessage),
      NumberValidator.validate(`status`, data.status, {
        integer: true,
        equalsTo: STATUS_NOT_FOUND,
      }),
    ].filter(Boolean);
  };
}
