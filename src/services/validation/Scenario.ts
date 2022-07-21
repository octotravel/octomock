export interface Scenario<T> {
  validate: () => Promise<ScenarioResult<T>>;
}

export interface ScenarioResult<T> {
  name: string;
  success: boolean;
  errors: string[];
  data: Nullable<T>;
}
