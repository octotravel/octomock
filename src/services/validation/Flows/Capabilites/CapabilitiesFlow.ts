import { ApiClient } from "../../ApiClient";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { FlowResult } from "../Flow";
import { GetCapabilitiesScenario } from "../../Scenarios/Capabilities/GetCapabilities";

export class CapabilitiesFlow {
  private apiClient: ApiClient;
  constructor({ url, apiKey }: { url: string; apiKey: string }) {
    this.apiClient = new ApiClient({
      url: url,
      apiKey: apiKey,
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
    const scenarios = [await this.validateGetCapabilitiess()];

    const results = [];
    for await (const scenario of scenarios) {
      const result = await scenario.validate();
      results.push(result);
      if (!result.success) {
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
}
