import { Product } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { GetProductScenario } from "../../Scenarios/Product/GetProduct";
import { GetProductInvalidScenario } from "../../Scenarios/Product/GetProductInvalid";
import { GetProductsScenario } from "../../Scenarios/Product/GetProducts";
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
    const getProduct = await Promise.all(await this.validateGetProduct());
    const getProducts = await this.validateGetProducts();
    const getProductInvalid = await this.validateGetProductInvalid();
    const scenarios = [...getProduct, getProducts, getProductInvalid];
    return {
      name: "Get Products",
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      success: scenarios.every((scenario) => scenario.success),
      scenarios: scenarios,
    };
  };

  private validateGetProduct = async (): Promise<
    Promise<ScenarioResult<Product>>[]
  > => {
    return this.config.getProductConfigs().map((productConfig) => {
      return new GetProductScenario({
        apiClient: this.apiClient,
        productId: productConfig.productId,
        capabilities: this.config.capabilities,
      }).validate();
    });
  };
  private validateGetProducts = async (): Promise<
    ScenarioResult<Product[]>
  > => {
    return new GetProductsScenario({
      apiClient: this.apiClient,
      capabilities: this.config.capabilities,
    }).validate();
  };
  private validateGetProductInvalid = async (): Promise<
    ScenarioResult<null>
  > => {
    return new GetProductInvalidScenario({
      apiClient: this.apiClient,
      productId: "badProductID",
    }).validate();
  };
}
