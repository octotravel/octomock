import { CapabilityId, Supplier } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../Scenario";
import { SupplierScenarioHelper } from "../../helpers/SupplierScenarioHelper";

export class GetSupplierScenario implements Scenario<Supplier> {
  private apiClient: ApiClient;
  private supplierId: string;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    supplierId,
    capabilities,
  }: {
    apiClient: ApiClient;
    supplierId: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.supplierId = supplierId;
    this.capabilities = capabilities;
  }
  private supplierScenarioHelper = new SupplierScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getSupplier({
      id: this.supplierId,
    });
    const name = "Get Supplier";

    return this.supplierScenarioHelper.validateSupplier(
      {
        ...result,
        name,
      },
      this.capabilities
    );
  };
}
