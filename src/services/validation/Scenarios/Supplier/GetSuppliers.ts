import { CapabilityId, Supplier } from "@octocloud/types";
import { ApiClient } from "../../api/ApiClient";
import { Scenario } from "../Scenario";
import { SupplierScenarioHelper } from "../../helpers/SupplierScenarioHelper";

export class GetSupplierScenario implements Scenario<Supplier> {
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
    const result = await this.apiClient.getSupplier();
    const name = "Get Supplier";

    return this.supplierScenarioHelper.validateSupplier(
      {
        result,
        name,
      },
      this.capabilities
    );
  };
}
