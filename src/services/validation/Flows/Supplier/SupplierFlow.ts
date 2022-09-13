import { Config } from "../../config/Config";
import { Scenario, ScenarioResult } from "../../Scenarios/Scenario";
import { GetSupplierScenario } from "../../Scenarios/Supplier/GetSuppliers";
import { BaseFlow } from "../BaseFlow";
import { Flow, FlowResult } from "../Flow";

export class SupplierFlow extends BaseFlow implements Flow {
  private config = Config.getInstance();
  constructor() {
    super("Get Suppliers");
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios: Scenario<unknown>[] = [new GetSupplierScenario()];

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
}
