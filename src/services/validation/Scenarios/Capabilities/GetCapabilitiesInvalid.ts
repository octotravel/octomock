import { BadRequestErrorValidator } from "../../../../validators/backendValidator/Error/BadRequestErrorValidator";
import { ApiClient } from "../../ApiClient";
import { CapabilitiesScenarioHelper } from "../../helpers/CapabilitiesScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class GetCapabilitiesInvalidScenario implements Scenario<null> {
  private apiClient: ApiClient;
  constructor({ apiClient }: { apiClient: ApiClient }) {
    this.apiClient = apiClient;
  }
  private capabilitiesScenarioHelper = new CapabilitiesScenarioHelper();

  public validate = async (): Promise<ScenarioResult<null>> => {
    const result = await this.apiClient.getCapabilities();

    const name = `Get Capabilities Invalid (400 BAD_REQUEST)`;
    const error = "Response should be BAD_REQUEST";

    return this.capabilitiesScenarioHelper.validateCapabilitiesError(
      {
        ...result,
        name,
      },
      error,
      new BadRequestErrorValidator()
    );
  };
}
