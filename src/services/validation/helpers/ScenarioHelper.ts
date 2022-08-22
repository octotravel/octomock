import { CapabilityId, DeliveryMethod } from "@octocloud/types";
import { ResultRequest, ResultResponse } from "../ApiClient";

interface ScenarioData {
  name: string;
  success: boolean;
  request: any;
  response: any;
  errors: any[];
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
  public handleResult = (data: ScenarioData) => {
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
      errors: data.errors.map((error) => error.message),
    };
  };
}
