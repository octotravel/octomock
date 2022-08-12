export interface Scenario<T> {
  validate: () => Promise<ScenarioResult<T>>;
}

export interface ScenarioRequest {
  url: string;
  body: Nullable<any>;
}

export interface ScenarioResponse<T> {
  body: Nullable<T>;
  status: number;
  error: Nullable<{
    body: any;
  }>;
}

export interface ScenarioResult<T> {
  name: string;
  success: boolean;
  request: ScenarioRequest;
  response: ScenarioResponse<T>;
  errors: string[]; // validation errors
}
