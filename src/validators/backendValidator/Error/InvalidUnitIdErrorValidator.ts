import { ValidatedError } from "./index";
import { NumberValidator } from "./../ValidatorHelpers";
import { INVALID_UNIT_ID, STATUS_BAD_REQUEST } from "./../../../models/Error";
import {
  ModelValidator,
  StringValidator,
  ValidatorError,
} from "../ValidatorHelpers";

export class InvalidUnitIdErrorValidator implements ModelValidator {
  public validate = (data: ValidatedError): ValidatorError[] => {
    return [
      StringValidator.validate(`error`, data.body.error, {
        equalsTo: INVALID_UNIT_ID,
      }),
      StringValidator.validate(`errorMessage`, data.body.errorMessage),
      StringValidator.validate(`unitId`, data.body.unitId),
      NumberValidator.validate(`status`, data.status, {
        integer: true,
        equalsTo: STATUS_BAD_REQUEST,
      }),
    ].filter(Boolean);
  };
}