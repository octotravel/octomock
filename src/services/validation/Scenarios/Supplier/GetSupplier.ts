import * as R from "ramda";
import { Supplier } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../Scenario";
import { SupplierValidator } from "../../../../validators/backendValidator/Supplier/SupplierValidator";

export class GetSupplierScenario implements Scenario<Supplier> {
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

  public validate = async () => {
    const { request, response } = await this.apiClient.getSupplier({
      id: this.supplierId,
    });
    const name = "Get Supplier";

    if (response.error) {
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
        errors: [],
      };
    }

    const errors = new SupplierValidator().validate(response.data.body);
    if (!R.isEmpty(errors)) {
      return {
        name,
        success: false,
        request,
        response: {
          body: response.data.body,
          status: response.data.status,
          error: null,
        },
        errors: errors.map((error) => error.message),
      };
    }
    return {
      name,
      success: true,
      request,
      response: {
        body: response.data.body,
        status: response.data.status,
        error: null,
      },
      errors: [],
    };
  };
}
