import * as R from "ramda";
import { Supplier } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../../Scenario";
import { SupplierValidator } from "../../../../validators/backendValidator/Supplier/SupplierValidator";

export class SuppliersScenario implements Scenario<Supplier[]> {
  private apiClient: ApiClient;
  constructor({ apiClient }: { apiClient: ApiClient }) {
    this.apiClient = apiClient;
  }

  public validate = async () => {
    const { result, error } = await this.apiClient.getSuppliers();
    const name = "Correct suppliers";
    if (error) {
      return {
        name,
        success: false,
        errors: [],
        data: result,
      };
    }

    const errors = result
      .map((supplier) => {
        return new SupplierValidator().validate(supplier);
      })
      .flat(1);
    if (!R.isEmpty(errors)) {
      return {
        name,
        success: false,
        errors: errors.map((error) => error.message),
        data: result,
      };
    }
    return {
      name,
      success: true,
      errors: [],
      data: result,
    };
  };
}
