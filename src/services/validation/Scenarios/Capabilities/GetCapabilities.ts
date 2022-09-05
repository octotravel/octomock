import { CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../Scenario";
import { CapabilitiesScenarioHelper } from "../../helpers/CapabilitiesScenarioHelper";

export class GetCapabilitiesScenario implements Scenario<CapabilityId[]> {
  private apiClient: ApiClient;
  constructor({ apiClient }: { apiClient: ApiClient }) {
    this.apiClient = apiClient;
  }
  private capabilitiesScenarioHelper = new CapabilitiesScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getCapabilities();
    const name = "Get Capabilities";

    return this.capabilitiesScenarioHelper.validateCapabilities({
      ...result,
      name,
    });
  };
}
