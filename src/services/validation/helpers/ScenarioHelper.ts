import { ValidatedError } from "../../../validators/backendValidator/Error";

export class ScenarioHelper {
  public handleResult = (
    name: string,
    success: boolean,
    request: any,
    data: any,
    errors: any[]
  ) => {
    return {
      name,
      success,
      request,
      response: {
        body: data.body,
        status: data.status,
        error: null,
      },
      errors: errors.map((error) => error.message),
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
