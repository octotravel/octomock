import * as R from "ramda";
import {
  Availability,
  CapabilityId,
} from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../Scenario";
import { AvailabilityValidator } from "../../../../validators/backendValidator/Availability/AvailabilityValidator";
import { ScenarioHelper } from "../../helpers/ScenarioHelper";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";

export class AvailabilityCheckAvailabilityIdScenario
  implements Scenario<Availability[]>
{
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private availabilityIds: string[];
  private availabilityType: string;
  private capabilities: CapabilityId[];
  private scenarioHelper = new ScenarioHelper();
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();
  constructor({
    apiClient,
    productId,
    optionId,
    availabilityIds,
    availabilityType,
    capabilities,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    availabilityIds: string[];
    availabilityType: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.availabilityIds = availabilityIds;
    this.availabilityType = availabilityType;
    this.capabilities = capabilities;
  }

  public validate = async () => {
    const { request, response } = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      availabilityIds: this.availabilityIds,
    });
    const name = `Availability Check AvailabilityId (${this.availabilityType})`;
    if (response.error) {
      return this.scenarioHelper.handleErrorResult(
        name,
        request,
        response.error
      );
    }

    if (R.isEmpty(response.data.body)) {
      return this.scenarioHelper.handleResult(
        name,
        false,
        request,
        response.data,
        ["Availability has to be available"]
      );
    }

    if (
      this.availabilityScenarioHelper.checkAvailabilityStatus(
        response.data.body
      )
    ) {
      return this.scenarioHelper.handleResult(
        name,
        false,
        request,
        response.data,
        ["Availability can not be SOLD_OUT or CLOSED or not available"]
      );
    }

    const errors = response.data.body.reduce((acc, result) => {
      return [
        ...acc,
        ...new AvailabilityValidator({
          capabilities: this.capabilities,
        }).validate(result),
      ];
    }, []);
    return this.scenarioHelper.handleResult(
      name,
      R.isEmpty(errors),
      request,
      response.data,
      errors
    );
  };
}
