import { ValidatedError } from "../../../validators/backendValidator/Error";

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
        body: data.response.body,
        status: data.response.status,
        error: null,
      },
      errors: data.errors.map((error) => error.message),
    };
  };

  public handleErrorResult = (
    name: string,
    request: any,
    error: ValidatedError
  ) => {
    return {
      name,
      success: false,
      request,
      response: {
        body: null,
        status: error.status,
        error: {
          body: error.body,
        },
      },
      errors: [],
    };
  };
}
