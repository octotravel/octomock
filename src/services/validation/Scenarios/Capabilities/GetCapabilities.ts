import { Capability } from "@octocloud/types";
import { Scenario } from "../Scenario";
import { CapabilitiesScenarioHelper } from "../../helpers/CapabilitiesScenarioHelper";
import { Config } from "../../config/Config";

export class GetCapabilitiesScenario implements Scenario<Capability[]> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private capabilitiesScenarioHelper = new CapabilitiesScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getCapabilities();
    const name = "Get Capabilities";

    return this.capabilitiesScenarioHelper.validateCapabilities({
      result,
      name,
    });
  };
}
