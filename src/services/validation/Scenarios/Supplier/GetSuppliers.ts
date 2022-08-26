import { CapabilityId, Supplier } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../Scenario";
import { SupplierScenarioHelper } from "../../helpers/SupplierScenarioHelper";

export class GetSuppliersScenario implements Scenario<Supplier[]> {
  private apiClient: ApiClient;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    capabilities,
  }: {
    apiClient: ApiClient;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.capabilities = capabilities;
  }
  private supplierScenarioHelper = new SupplierScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getSuppliers();
    const name = "Get Suppliers";

    return this.supplierScenarioHelper.validateSupplier(
      {
        ...result,
        name,
      },
      this.capabilities
    );
  };
}
