import { BadRequestErrorValidator } from "../../../../validators/backendValidator/Error/BadRequestErrorValidator";
import { ApiClient } from "../../ApiClient";
import { SupplierScenarioHelper } from "../../helpers/SupplierScenarioHelper";
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
  private supplierScenarioHelper = new SupplierScenarioHelper();

  public validate = async (): Promise<ScenarioResult<null>> => {
    const result = await this.apiClient.getSupplier({
      id: this.supplierId,
    });
    const name = `Get Supplier Invalid (400 BAD_REQUEST)`;
    const error = "Response should be BAD_REQUEST";

    return this.supplierScenarioHelper.validateSupplierError(
      {
        ...result,
        name,
      },
      error,
      new BadRequestErrorValidator()
    );
  };
}
