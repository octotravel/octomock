import { Supplier } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenario";
import { SupplierScenario } from "../../Scenarios/Supplier/Supplier";
import { SupplierErrorScenario } from "../../Scenarios/Supplier/SupplierError";
import { SuppliersScenario } from "../../Scenarios/Supplier/Suppliers";
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
    const supplier = await this.validateSupplier();
    const suppliers = await this.validateSuppliers();
    const supplierError = await this.validateSupplierError();
    const scenarios = [supplier, suppliers, supplierError];
    return {
      name: "Supplier Flow",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  private validateSupplier = async (): Promise<ScenarioResult<Supplier>> => {
    return new SupplierScenario({
      apiClient: this.apiClient,
      supplierId: this.config.supplierId,
    }).validate();
  };
  private validateSuppliers = async (): Promise<ScenarioResult<Supplier[]>> => {
    return new SuppliersScenario({
      apiClient: this.apiClient,
    }).validate();
  };
  private validateSupplierError = async (): Promise<ScenarioResult<null>> => {
    return new SupplierErrorScenario({
      apiClient: this.apiClient,
      supplierId: "bad supplierId",
    }).validate();
  };
}
