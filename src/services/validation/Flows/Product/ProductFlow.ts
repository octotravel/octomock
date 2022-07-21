import { Product } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenario";
import { ProductScenario } from "../../Scenarios/Product/Product";
import { ProductErrorScenario } from "../../Scenarios/Product/ProductError";
import { ProductsScenario } from "../../Scenarios/Product/Products";
import { Flow } from "../Flow";

export class ProductFlow {
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
    const product = await Promise.all(await this.validateProduct());
    const products = await this.validateProducts();
    const productError = await this.validateProductError();
    const scenarios = [...product, products, productError];
    return {
      name: "Product Flow",
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      success: scenarios.every((scenario) => scenario.success),
      scenarios: scenarios,
    };
  };

  private validateProduct = async (): Promise<
    Promise<ScenarioResult<Product>>[]
  > => {
    return this.config.getProductConfigs().map((productConfig) => {
      return new ProductScenario({
        apiClient: this.apiClient,
        productId: productConfig.productId,
        capabilities: this.config.capabilities,
      }).validate();
    });
  };
  private validateProducts = async (): Promise<ScenarioResult<Product[]>> => {
    return new ProductsScenario({
      apiClient: this.apiClient,
      capabilities: this.config.capabilities,
    }).validate();
  };
  private validateProductError = async (): Promise<ScenarioResult<null>> => {
    return new ProductErrorScenario({
      apiClient: this.apiClient,
      productId: "badProductID",
    }).validate();
  };
}
