import * as R from "ramda";
import { CapabilityId } from "@octocloud/types";
import { STATUS_NOT_FOUND } from "../../../models/Error";
import {
  ErrorType,
  ModelValidator,
  ValidatorError,
} from "../../../validators/backendValidator/ValidatorHelpers";
import { Result } from "../api/types";
import { ScenarioResult } from "../Scenarios/Scenario";

interface ScenarioData<T> {
  name: string;
  success: boolean;
  result: Result<T>;
  errors: ValidatorError[];
}

export interface ScenarioHelperData<T> {
  name: string;
  result: Result<T>;
}

export interface ScenarioConfigData {
  capabilities?: CapabilityId[];
  supplierReference?: string;
  resellerReference?: string;
}

export class ScenarioHelper {
  protected handleResult = <T>(data: ScenarioData<T>): ScenarioResult<T> => {
    const { result } = data;
    if (result.response.error) {
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
    return {
      name: data.name,
      success: data.success,
      request: result.request,
      response: {
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
      },
      errors: data.errors.map((error) => error.mapError()),
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
      success: R.isEmpty(errors),
      errors: errors,
    });
  };
}
