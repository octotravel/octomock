import { ScenarioResult } from "../Scenarios/Scenario";
import { FlowResult } from "./Flow";

export abstract class BaseFlow {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }
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
}
