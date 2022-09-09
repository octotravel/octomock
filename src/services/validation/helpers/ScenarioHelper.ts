import { CapabilityId, DeliveryMethod } from "@octocloud/types";
import { STATUS_NOT_FOUND } from "../../../models/Error";
import {
  ErrorType,
  ValidatorError,
} from "../../../validators/backendValidator/ValidatorHelpers";
import { ResultRequest, ResultResponse } from "../ApiClient";
import { ScenarioResult } from "../Scenarios/Scenario";

interface ScenarioData {
  name: string;
  success: boolean;
  request: any;
  response: any;
  errors: ValidatorError[];
}

export interface ScenarioHelperData<T> {
  name: string;
  request: ResultRequest<T>;
  response: ResultResponse<T>;
}

export interface ScenarioConfigData {
  capabilities?: CapabilityId[];
  deliveryMethods?: DeliveryMethod[];
  supplierReference?: string;
  resellerReference?: string;
}

export class ScenarioHelper {
  public handleResult = (data: ScenarioData): ScenarioResult<any> => {
    if (data.response.error) {
      if (data.response.error.status === STATUS_NOT_FOUND) {
        data.errors = {
          ...data.errors,
          ...new ValidatorError({
            type: ErrorType.CRITICAL,
            message: "Endpoint not implemented",
          }),
        };
      }
    }
    return {
      name: data.name,
      success: data.success,
      request: data.request,
      response: {
        body: data.response.data ? data.response.data.body : null,
        status: data.response.data
          ? data.response.data.status
          : data.response.error.status,
        error: data.response.error
          ? {
              body: data.response.error.body,
            }
          : null,
      },
      errors: data.errors.map((error) => error.mapError()),
    };
  };
}
