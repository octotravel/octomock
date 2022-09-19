import { Config } from "../config/Config";
import { Scenario, ScenarioResult } from "../Scenarios/Scenario";
import { FlowResult } from "./Flow";

export abstract class BaseFlow {
  protected config = Config.getInstance();
  private name: string;
  constructor(name: string) {
    this.name = name;
  }
  // TODO: make private after it's removed from all flows
  protected getFlowResult = (
    scenarios: ScenarioResult<unknown>[]
  ): FlowResult => {
    return {
      name: this.name,
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  protected validateScenarios = async (scenarios: Scenario<unknown>[]) => {
    const results = [];
    for await (const scenario of scenarios) {
      const result = await scenario.validate();
      results.push(result);
      if (!result.success && this.config.ignoreKill === true) {
        break;
      }
    }

    return this.getFlowResult(results);
  };
}
