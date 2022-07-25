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
  public validate = async (): Promise<Flow> => {
    const getSupplier = await this.validateGetSupplier();
    const getSuppliers = await this.validateGetSuppliers();
    const getSupplierInvalid = await this.validateGetSupplierInvalid();
    const scenarios = [getSupplier, getSuppliers, getSupplierInvalid];
    return {
      name: "Get Suppliers",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
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
      supplierId: "bad supplierId",
    }).validate();
  };
}
