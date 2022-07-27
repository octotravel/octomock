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

  private setFlow = (scenarios: ScenarioResult<any>[]): Flow => {
    const noProducts = this.config.getProductConfigs().length;
    return {
      name: "Get Products",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: noProducts + 2,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<Flow> => {
    const scenarios = [];

    const getProduct = await Promise.all(await this.validateGetProduct());
    scenarios.push(...getProduct);
    if (
      !getProduct.map((scenario) => scenario.success).some((status) => status)
    )
      return this.setFlow(scenarios);

    const getProducts = await this.validateGetProducts();
    scenarios.push(getProducts);
    if (!getProducts.success) return this.setFlow(scenarios);

    const getProductInvalid = await this.validateGetProductInvalid();
    scenarios.push(getProductInvalid);
    if (!getProductInvalid.success) return this.setFlow(scenarios);

    return this.setFlow(scenarios);
  };

  private validateGetProduct = async (): Promise<
    Promise<ScenarioResult<Product>>[]
  > => {
    return this.config.getProductConfigs().map((productConfig) => {
      return new GetProductScenario({
        apiClient: this.apiClient,
        productId: productConfig.productId,
        availabilityType: productConfig.availabilityType,
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
      productId: "Invalid productId",
    }).validate();
  };
}
