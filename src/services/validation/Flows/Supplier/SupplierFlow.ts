import { ApiClient } from "../../api/ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { GetSupplierScenario } from "../../Scenarios/Supplier/GetSuppliers";
import { FlowResult } from "../Flow";

export class SupplierFlow {
  private config: Config;
  private apiClient: ApiClient;
  constructor({ config }: { config: Config }) {
    this.config = config;
    this.apiClient = new ApiClient({
      url: config.endpoint,
      capabilities: config.getCapabilityIDs(),
      apiKey: this.config.apiKey,
    });
  }

  private setFlow = (scenarios: ScenarioResult<any>[]): FlowResult => {
    return {
      name: "Get Suppliers",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<FlowResult> => {
    const scenarios = [await this.validateGetSuppliers()];

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

  private validateGetSuppliers = async (): Promise<GetSupplierScenario> => {
    return new GetSupplierScenario({
      apiClient: this.apiClient,
      capabilities: this.config.getCapabilityIDs(),
    });
  };
}
