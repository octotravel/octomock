import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { GetCapabilitiesInvalidScenario } from "../../Scenarios/Capabilities/GetCapabilitiesInvalid";
import { FlowResult } from "../Flow";
import { GetCapabilitiesScenario } from "../../Scenarios/Capabilities/GetCapabilities";

export class CapabilitiesFlow {
  private config: Config;
  private apiClient: ApiClient;
  constructor({ config }: { config: Config }) {
    this.config = config;
    this.apiClient = new ApiClient({
      url: config.url,
      capabilities: config.capabilities,
      apiKey: this.config.apiKey,
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
    const scenarios = [
      await this.validateGetCapabilitiess(),
      await this.validateGetCapabilitiesInvalid(),
    ];

    const results = [];
    for await (const scenario of scenarios) {
      const result = await scenario.validate();
      results.push(result);
      if (!result.success && !this.config.ignoreKill) {
        break;
      }
    }
    return this.setFlow(results);
  };

  private validateGetCapabilitiess =
    async (): Promise<GetCapabilitiesScenario> => {
      return new GetCapabilitiesScenario({
        apiClient: this.apiClient,
      });
    };
  private validateGetCapabilitiesInvalid =
    async (): Promise<GetCapabilitiesInvalidScenario> => {
      return new GetCapabilitiesInvalidScenario({
        apiClient: this.apiClient,
      });
    };
}
