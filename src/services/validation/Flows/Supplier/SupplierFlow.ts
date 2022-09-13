import { ApiClient } from "../../api/ApiClient";
import { Config } from "../../config/Config";
import { Scenario, ScenarioResult } from "../../Scenarios/Scenario";
import { GetSupplierScenario } from "../../Scenarios/Supplier/GetSuppliers";
import { BaseFlow } from "../BaseFlow";
import { Flow, FlowResult } from "../Flow";

export class SupplierFlow extends BaseFlow implements Flow {
  private config = Config.getInstance();
  private apiClient: ApiClient;
  constructor() {
    super("Get Suppliers");
    this.apiClient = new ApiClient({
      url: this.config.getEndpointData().endpoint,
      apiKey: this.config.getEndpointData().apiKey,
      capabilities: this.config.getCapabilityIDs(),
    });
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios: Scenario<unknown>[] = [await this.validateGetSuppliers()];

    const results: ScenarioResult<unknown>[] = [];
    for await (const scenario of scenarios) {
      const result = await scenario.validate();
      results.push(result);
      if (!result.success && !this.config.ignoreKill) {
        break;
      }
    }
    return this.getFlowResult(results);
  };

  private validateGetSuppliers = async (): Promise<GetSupplierScenario> => {
    return new GetSupplierScenario({
      apiClient: this.apiClient,
      capabilities: this.config.getCapabilityIDs(),
    });
  };
}
