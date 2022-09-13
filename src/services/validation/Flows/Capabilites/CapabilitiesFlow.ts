import { ApiClient } from "../../api/ApiClient";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { FlowResult } from "../Flow";
import { GetCapabilitiesScenario } from "../../Scenarios/Capabilities/GetCapabilities";
import { Config } from "../../config/Config";

export class CapabilitiesFlow {
  private config = Config.getInstance();
  private apiClient: ApiClient;
  constructor() {
    this.apiClient = new ApiClient({
      url: this.config.getEndpointData().endpoint,
      apiKey: this.config.getEndpointData().apiKey,
    });
  }

  private setFlow = (scenarios: ScenarioResult<any>[]): FlowResult => {
    return {
      name: "Get Capabilities",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<FlowResult> => {
    console.log(this.config);
    const scenario = await this.validateGetCapabilities();
    const result = await scenario.validate();

    return this.setFlow([result]);
  };

  private validateGetCapabilities =
    async (): Promise<GetCapabilitiesScenario> => {
      return new GetCapabilitiesScenario({
        apiClient: this.apiClient,
      });
    };
}
