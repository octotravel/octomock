import { CapabilityId } from "@octocloud/types";
import * as R from "ramda";
import { STATUS_NOT_FOUND } from "../../../models/Error";
import {
  ErrorType,
  ModelValidator,
  ValidatorError,
} from "../../../validators/backendValidator/ValidatorHelpers";
import { Result } from "../api/types";
import { Config } from "../config/Config";
import { ScenarioResult, ValidationResult } from "../Scenarios/Scenario";

interface ScenarioData<T> {
  name: string;
  success?: boolean;
  result: Result<T>;
  errors: ValidatorError[];
  description: string;
}

export interface ScenarioHelperData<T> {
  name: string;
  result: Result<T>;
  description: string;
}

export interface ScenarioConfigData {
  capabilities?: CapabilityId[];
  supplierReference?: string;
  resellerReference?: string;
}

export class ScenarioHelper {
  protected config = Config.getInstance();
  private getValidationResult = <T>(data: ScenarioData<T>): ValidationResult => {
    if (!R.isEmpty(data.errors)) {
      if (data.errors.some((error) => error.type === ErrorType.CRITICAL)) {
        return ValidationResult.FAILED;
      }
      if (data.errors.some((error) => error.type === ErrorType.WARNING)) {
        return ValidationResult.WARNING;
      }
    }
    return ValidationResult.SUCCESS;
  };

  protected handleResult = <T>(data: ScenarioData<T>): ScenarioResult<T> => {
    const { result } = data;
    if (result?.response?.error) {
      if (result.response.error.status === STATUS_NOT_FOUND) {
        data.errors = [
          ...data.errors,
          new ValidatorError({
            type: ErrorType.CRITICAL,
            message: "Endpoint not implemented",
          }),
        ];
      }
    }
    const response =
      result?.response === null
        ? null
        : {
            headers: result.response.headers,
            body: result.response.data ? result.data : null,
            status: result.response.data
              ? result.response.data.status
              : result.response.error.status,
            error: result.response.error
              ? {
                  body: result.response.error.body,
                }
              : null,
          };
    return {
      name: data.name,
      success: data.success ?? this.isSuccess(data.errors),
      validationResult: this.getValidationResult(data),
      request: result.request,
      response: response,
      errors: data.errors.map((error) => error?.mapError()),
      description: data.description,
    };
  };

  public validateError = <T>(
    data: ScenarioHelperData<T>,
    error: string,
    validator: ModelValidator
  ) => {
    const { result } = data;
    if (result.response.data) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [
          new ValidatorError({
            message: error,
          }),
        ],
      });
    }

    const errors = validator.validate(result.response.error);
    return this.handleResult({
      ...data,
      success: this.isSuccess(errors),
      errors: errors,
    });
  };

  protected isSuccess = (errors: ValidatorError[]): boolean => {
    return !errors.some((e) => e.type === ErrorType.CRITICAL);
  };
}
