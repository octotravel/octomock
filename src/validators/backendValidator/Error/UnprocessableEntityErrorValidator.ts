import { ValidatedError } from "./index";
import { NumberValidator } from "./../ValidatorHelpers";
import { STATUS_BAD_REQUEST, UNPROCESSABLE_ENTITY } from "../../../models/Error";
import { ModelValidator, StringValidator, ValidatorError } from "../ValidatorHelpers";

export class UnprocessableEntityErrorValidator implements ModelValidator {
  public validate = (data: ValidatedError): ValidatorError[] => {
    return [
      StringValidator.validate(`error`, data?.body?.error, {
        equalsTo: UNPROCESSABLE_ENTITY,
      }),
      StringValidator.validate(`errorMessage`, data?.body?.errorMessage),
      NumberValidator.validate(`status`, data?.status, {
        integer: true,
        equalsTo: STATUS_BAD_REQUEST,
      }),
    ].flatMap((v) => (v ? [v] : []));
  };
}
