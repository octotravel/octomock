import { Scenario } from "./../../Scenarios/Scenario";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { GetProductScenario } from "../../Scenarios/Product/GetProduct";
import { GetProductInvalidScenario } from "../../Scenarios/Product/GetProductInvalid";
import { GetProductsScenario } from "../../Scenarios/Product/GetProducts";
import { Flow, FlowResult } from "../Flow";
import { BaseFlow } from "../BaseFlow";

export class ProductFlow extends BaseFlow implements Flow {
  private config = Config.getInstance();
  constructor() {
    super("Get Products");
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios: Scenario<unknown>[] = [
      new GetProductsScenario(),
      new GetProductScenario(),
      new GetProductInvalidScenario(),
    ];

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
