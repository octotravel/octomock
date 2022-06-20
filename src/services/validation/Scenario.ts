import { ValidatorError } from "../../validators/backendValidator/ValidatorHelpers";

export interface Scenario<T> {
  validate: () => Promise<ScenarioResult<T>>;
}

export interface ScenarioResult<T> {
  success: boolean;
  errors: ValidatorError[];
  data: Nullable<T>;
}
