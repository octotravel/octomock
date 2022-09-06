import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { GetSuppliersScenario } from "../../Scenarios/Supplier/GetSuppliers";
import { GetSupplierInvalidScenario } from "../../Scenarios/Supplier/GetSupplierInvalid";
import { FlowResult } from "../Flow";

export class SupplierFlow {
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
      name: "Get Suppliers",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<FlowResult> => {
    const scenarios = [
      await this.validateGetSuppliers(),
      await this.validateGetSupplierInvalid(),
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

  private validateGetSuppliers = async (): Promise<GetSuppliersScenario> => {
    return new GetSuppliersScenario({
      apiClient: this.apiClient,
      capabilities: this.config.capabilities,
    });
  };
  private validateGetSupplierInvalid =
    async (): Promise<GetSupplierInvalidScenario> => {
      return new GetSupplierInvalidScenario({
        apiClient: this.apiClient,
        supplierId: "Invalid_supplierId",
      });
    };
}
