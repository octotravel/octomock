import * as R from "ramda";
import { BadRequestErrorValidator } from "../../../../validators/backendValidator/Error/BadRequestErrorValidator";
import { ApiClient } from "../../ApiClient";
import { Scenario, ScenarioResult } from "../Scenario";

export class GetSupplierInvalidScenario implements Scenario<null> {
  private apiClient: ApiClient;
  private supplierId: string;
  constructor({
    apiClient,
    supplierId,
  }: {
    apiClient: ApiClient;
    supplierId: string;
  }) {
    this.apiClient = apiClient;
    this.supplierId = supplierId;
  }

  public validate = async (): Promise<ScenarioResult<null>> => {
    const { request, response } = await this.apiClient.getSupplier({
      id: this.supplierId,
    });
    const name = `Get Supplier Invalid`;
    if (response.data) {
      return {
        name,
        success: false,
        request,
        response: {
          body: response.data.body as null,
          status: response.data.status,
          error: null,
        },
        errors: ["Response should be BAD_REQUEST"],
      };
    }

    const errors = new BadRequestErrorValidator().validate(response.error);
    if (!R.isEmpty(errors)) {
      return {
        name,
        success: false,
        request,
        response: {
          body: null,
          status: response.error.status,
          error: {
            body: response.error.body,
          },
        },
        errors: errors.map((error) => error.message),
      };
    }
    return {
      name,
      success: true,
      request,
      response: {
        body: null,
        status: response.error.status,
        error: {
          body: response.error.body,
        },
      },
      errors: [],
    };
  };
}
