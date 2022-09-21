import { ValidatorError } from "../../../validators/backendValidator/ValidatorHelpers";
import { Scenario, ScenarioResult, ValidationResult } from "./Scenario";

export class ErrorScenario implements Scenario<unknown> {
  private errors: ValidatorError[] = [];
  constructor(errors: ValidatorError[]) {
    this.errors = errors;
  }
  public validate = async (): Promise<ScenarioResult<unknown>> => {
    return {
      name: "",
      success: false,
      validationResult: ValidationResult.FAILED,
      request: null,
      response: null,
      errors: this.errors,
      description: "",
    };
  };
}
