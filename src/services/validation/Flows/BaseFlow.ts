import { Config } from "../config/Config";
import {
  Scenario,
  ScenarioResult,
  ValidationResult,
} from "../Scenarios/Scenario";
import { FlowResult } from "./Flow";

export abstract class BaseFlow {
  protected config = Config.getInstance();
  private name: string;
  private docs: string;
  constructor(name: string, docs: string) {
    this.name = name;
    this.docs = docs;
  }
  private getValidationResult = (
    scenarios: ScenarioResult<unknown>[]
  ): ValidationResult => {
    const failed = scenarios.filter(
      (scenario) => scenario.validationResult === ValidationResult.FAILED
    );
    const warning = scenarios.filter(
      (scenario) => scenario.validationResult === ValidationResult.WARNING
    );
    if (failed.length > 0) {
      return ValidationResult.FAILED;
    }
    if (warning.length > 0) {
      return ValidationResult.WARNING;
    }
    return ValidationResult.SUCCESS;
  };
  // TODO: make private after it's removed from all flows
  protected getFlowResult = (
    scenarios: ScenarioResult<unknown>[]
  ): FlowResult => {
    return {
      name: this.name,
      success: scenarios.every((scenario) => scenario.success),
      validationResult: this.getValidationResult(scenarios),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
      docs: this.docs,
    };
  };

  protected validateScenarios = async (scenarios: Scenario<unknown>[]) => {
    const results = [];
    for await (const scenario of scenarios) {
      const result = await scenario.validate();
      results.push(result);
      if (!result.success && this.config.ignoreKill === false) {
        break;
      }
    }

    return this.getFlowResult(results);
  };
}
