import { CapabilityId, DeliveryMethod } from "@octocloud/types";
import { STATUS_NOT_FOUND } from "../../../models/Error";
import {
  ErrorType,
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
  deliveryMethods?: DeliveryMethod[];
  supplierReference?: string;
  resellerReference?: string;
}

export class ScenarioHelper {
  public handleResult = <T>(data: ScenarioData<T>): ScenarioResult<T> => {
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
        body: result.response.data ? result.response.data.body : null,
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
}
