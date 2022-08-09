import {
  Availability,
  AvailabilityStatus,
  CapabilityId,
} from "@octocloud/types";
import R from "ramda";
import { AvailabilityValidator } from "../../../validators/backendValidator/Availability/AvailabilityValidator";
import { ScenarioHelper } from "./ScenarioHelper";

export interface AvailabilityScenarioData {
  name: string;
  request: any;
  response: any;
  capabilities: CapabilityId[];
}

export class AvailabilityScenarioHelper {
  private scenarioHelper = new ScenarioHelper();

  private checkAvailabilityStatus = (availability: Availability[]) => {
    return availability
      .map((availability) => {
        return (
          !availability.available ||
          availability.status === AvailabilityStatus.CLOSED ||
          availability.status === AvailabilityStatus.SOLD_OUT
        );
      })
      .some((status) => status);
  };

  private getErrors = (response: any, capabilities: CapabilityId[]) => {
    return response.data.body.reduce((acc, result) => {
      return [
        ...acc,
        ...new AvailabilityValidator({
          capabilities,
        }).validate(result),
      ];
    }, []);
  };

  public validateAvailability = (data: AvailabilityScenarioData) => {
    if (data.response.error) {
      return this.scenarioHelper.handleErrorResult(
        data.name,
        data.request,
        data.response.error
      );
    }

    if (R.isEmpty(data.response.data.body)) {
      return this.scenarioHelper.handleResult({
        name: data.name,
        success: false,
        request: data.request,
        response: data.response,
        errors: ["Availability has to be available"],
      });
    }
    if (this.checkAvailabilityStatus(data.response.data.body)) {
      return this.scenarioHelper.handleResult({
        name: data.name,
        success: false,
        request: data.request,
        response: data.response.data,
        errors: ["Availability can not be SOLD_OUT or CLOSED or not available"],
      });
    }

    const errors = this.getErrors(data.response, data.capabilities);

    return this.scenarioHelper.handleResult({
      name: data.name,
      success: R.isEmpty(errors),
      request: data.request,
      response: data.response,
      errors,
    });
  };
}
