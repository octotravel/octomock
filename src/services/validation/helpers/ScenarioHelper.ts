interface ScenarioData {
  name: string;
  success: boolean;
  request: any;
  response: any;
  errors: any[];
}

export class ScenarioHelper {
  public handleResult = (data: ScenarioData) => {
    return {
      name: data.name,
      success: data.success,
      request: data.request,
      response: {
        body: data.response.data ? data.response.data.body : null,
        status: data.response.data
          ? data.response.data.status
          : data.response.error.status,
        error: data.response.error
          ? {
              body: data.response.error.body,
            }
          : null,
      },
      errors: data.errors.map((error) => error.message),
    };
  };
}
