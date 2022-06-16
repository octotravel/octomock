import { ValidatedError } from "./index";
import { NumberValidator } from "../ValidatorHelpers";
import { INVALID_PRODUCT_ID, STATUS_BAD_REQUEST } from "../../../models/Error";
import {
  ModelValidator,
  StringValidator,
  ValidatorError,
} from "../ValidatorHelpers";

export class InvalidProductIdError implements ModelValidator {
  public validate = (data: ValidatedError): ValidatorError[] => {
    return [
      StringValidator.validate(`error`, data.body.error, {
        equalsTo: INVALID_PRODUCT_ID,
      }),
      StringValidator.validate(`errorMessage`, data.body.errorMessage),
      StringValidator.validate(`productId`, data.body.productId),
      NumberValidator.validate(`status`, data.status, {
        integer: true,
        equalsTo: STATUS_BAD_REQUEST,
      }),
    ].filter(Boolean);
  };
}
