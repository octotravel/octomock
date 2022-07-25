export interface Scenario<T> {
  validate: () => Promise<ScenarioResult<T>>;
}

export interface ScenarioResult<T> {
  name: string;
  success: boolean;
  request: {
    url: string;
    body: Nullable<any>; // json
  };
  response: {
    body: Nullable<T>; // json
    status: number;
    error: Nullable<{
      // error that tested api returns
      body: any; // json
    }>;
  };
  errors: string[]; // validation errors
}
