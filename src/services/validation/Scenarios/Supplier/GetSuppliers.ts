import { Supplier } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../Scenario";
import { SupplierScenarioHelper } from "../../helpers/SupplierScenarioHelper";

export class GetSuppliersScenario implements Scenario<Supplier[]> {
  private apiClient: ApiClient;
  constructor({ apiClient }: { apiClient: ApiClient }) {
    this.apiClient = apiClient;
  }
  private supplierScenarioHelper = new SupplierScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getSuppliers();
    const name = "Get Suppliers";

    return this.supplierScenarioHelper.validateSuppliers({
      ...result,
      name,
    });
  };
}
