import * as R from "ramda";
import { Supplier } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../Scenario";
import { SupplierValidator } from "../../../../validators/backendValidator/Supplier/SupplierValidator";

export class GetSuppliersScenario implements Scenario<Supplier[]> {
  private apiClient: ApiClient;
  constructor({ apiClient }: { apiClient: ApiClient }) {
    this.apiClient = apiClient;
  }

  public validate = async () => {
    const { request, response } = await this.apiClient.getSuppliers();
    const name = "Get Suppliers";
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

    const errors = response.data.body
      .map((supplier) => {
        return new SupplierValidator().validate(supplier);
      })
      .flat(1);
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
