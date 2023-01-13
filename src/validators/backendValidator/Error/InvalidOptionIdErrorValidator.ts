import { ValidatedError } from "./index";
import { NumberValidator } from "./../ValidatorHelpers";
import { INVALID_OPTION_ID, STATUS_BAD_REQUEST } from "./../../../models/Error";
import { ModelValidator, StringValidator, ValidatorError } from "../ValidatorHelpers";

export class InvalidOptionIdErrorValidator implements ModelValidator {
  public validate = (data: ValidatedError): ValidatorError[] => {
    return [
      StringValidator.validate(`error`, data?.body?.error, {
        equalsTo: INVALID_OPTION_ID,
      }),
      StringValidator.validate(`errorMessage`, data?.body?.errorMessage),
      StringValidator.validate(`optionId`, data?.body?.optionId),
      NumberValidator.validate(`status`, data?.status, {
        integer: true,
        equalsTo: STATUS_BAD_REQUEST,
      }),
    ].flatMap((v) => (v ? [v] : []));
  };
}
