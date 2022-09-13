import { ApiClient } from "../../ApiClient";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { FlowResult } from "../Flow";
import { GetCapabilitiesScenario } from "../../Scenarios/Capabilities/GetCapabilities";
import { Config } from "../../config/Config";

export class CapabilitiesFlow {
  private apiClient: ApiClient;
  private config: Config;
  constructor({ config }: { config: Config }) {
    this.config = config;
    this.apiClient = new ApiClient({
      url: config.endpoint,
      apiKey: config.apiKey,
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
    const scenario = await this.validateGetCapabilities();
    const result = await scenario.validate();

    if (result.success) {
      this.config.setCapabilities(result.response.body);
    }

    return this.setFlow([result]);
  };

  private validateGetCapabilities =
    async (): Promise<GetCapabilitiesScenario> => {
      return new GetCapabilitiesScenario({
        apiClient: this.apiClient,
      });
    };
}
