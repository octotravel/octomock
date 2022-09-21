import { Supplier } from "@octocloud/types";
import { Scenario } from "../Scenario";
import { SupplierScenarioHelper } from "../../helpers/SupplierScenarioHelper";
import { Config } from "../../config/Config";
import descriptions from "../../consts/descriptions";

export class GetSupplierScenario implements Scenario<Supplier> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private supplierScenarioHelper = new SupplierScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getSupplier();
    const name = "Get Supplier";
    const description = descriptions.getSupplier;

    return this.supplierScenarioHelper.validateSupplier({
      result,
      name,
      description,
    });
  };
}
