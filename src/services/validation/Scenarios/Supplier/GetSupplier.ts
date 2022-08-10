import { Supplier } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../Scenario";
import { SupplierScenarioHelper } from "../../helpers/SupplierScenarioHelper";

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
  private supplierScenarioHelper = new SupplierScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getSupplier({
      id: this.supplierId,
    });
    const name = "Get Supplier";

    return this.supplierScenarioHelper.validateSupplier({
      ...result,
      name,
    });
  };
}
