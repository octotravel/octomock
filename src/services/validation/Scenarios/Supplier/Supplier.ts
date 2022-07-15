import * as R from "ramda";
import { Supplier } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../../Scenario";
import { SupplierValidator } from "../../../../validators/backendValidator/Supplier/SupplierValidator";

export class SupplierScenario implements Scenario<Supplier> {
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
    const { result, error } = await this.apiClient.getSupplier({
      id: this.supplierId,
    });
    const name = "Correct supplier";
    if (error) {
      const data = error as unknown;
      return {
        name,
        success: false,
        errors: [error.body.errorMessage as string],
        data: data as Supplier,
      };
    }
    const errors = new SupplierValidator().validate(result);
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
