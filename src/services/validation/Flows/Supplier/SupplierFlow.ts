import { Supplier } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { GetSupplierScenario } from "../../Scenarios/Supplier/GetSupplier";
import { GetSuppliersScenario } from "../../Scenarios/Supplier/GetSuppliers";
import { GetSupplierInvalidScenario } from "../../Scenarios/Supplier/GetSupplierInvalid";
import { Flow } from "../Flow";

export class SupplierFlow {
  private config: Config;
  private apiClient: ApiClient;
  constructor({ config }: { config: Config }) {
    this.config = config;
    this.apiClient = new ApiClient({
      url: config.url,
      capabilities: config.capabilities,
    });
  }

  private setFlow = (scenarios: ScenarioResult<any>[]): Flow => {
    return {
      name: "Get Suppliers",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: 3,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<Flow> => {
    const scenarios = [];
    const getSupplier = await this.validateGetSupplier();
    scenarios.push(getSupplier);
    if (!getSupplier.success) return this.setFlow(scenarios);

    const getSuppliers = await this.validateGetSuppliers();
    scenarios.push(getSuppliers);
    if (!getSuppliers.success) return this.setFlow(scenarios);

    const getSupplierInvalid = await this.validateGetSupplierInvalid();
    scenarios.push(getSupplierInvalid);
    if (!getSupplierInvalid.success) return this.setFlow(scenarios);

    return this.setFlow(scenarios);
  };

  private validateGetSupplier = async (): Promise<ScenarioResult<Supplier>> => {
    return new GetSupplierScenario({
      apiClient: this.apiClient,
      supplierId: this.config.supplierId,
    }).validate();
  };
  private validateGetSuppliers = async (): Promise<
    ScenarioResult<Supplier[]>
  > => {
    return new GetSuppliersScenario({
      apiClient: this.apiClient,
    }).validate();
  };
  private validateGetSupplierInvalid = async (): Promise<
    ScenarioResult<null>
  > => {
    return new GetSupplierInvalidScenario({
      apiClient: this.apiClient,
      supplierId: "Invalid supplierId",
    }).validate();
  };
}
