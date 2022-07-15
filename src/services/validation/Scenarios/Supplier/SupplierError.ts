import * as R from "ramda";
import { BadRequestErrorValidator } from "../../../../validators/backendValidator/Error/BadRequestErrorValidator";
import { ApiClient } from "../../ApiClient";
import { Scenario, ScenarioResult } from "../../Scenario";

export class SupplierErrorScenario implements Scenario<null> {
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
    const { result, error } = await this.apiClient.getSupplier({
      id: this.supplierId,
    });
    const name = `Supplier with bad id`;
    if (result) {
      // test case failed
      return {
        name,
        success: false,
        errors: ["Response should be BAD_REQUEST"],
        data: result as null,
      };
    }

    const errors = new BadRequestErrorValidator().validate(error);
    if (!R.isEmpty(errors)) {
      return {
        name,
        success: false,
        errors: errors.map((error) => error.message),
        data: error as null,
      };
    }
    return {
      name,
      success: true,
      errors: [],
      data: error as null,
    };
  };
}
