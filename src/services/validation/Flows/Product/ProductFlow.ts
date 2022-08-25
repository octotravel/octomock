import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { GetProductScenario } from "../../Scenarios/Product/GetProduct";
import { GetProductInvalidScenario } from "../../Scenarios/Product/GetProductInvalid";
import { GetProductsScenario } from "../../Scenarios/Product/GetProducts";
import { FlowResult } from "../Flow";

export class ProductFlow {
  private config: Config;
  private apiClient: ApiClient;
  constructor({ config }: { config: Config }) {
    this.config = config;
    this.apiClient = new ApiClient({
      url: config.url,
      capabilities: config.capabilities,
      apiKey: this.config.apiKey,
    });
  }

  private setFlow = (scenarios: ScenarioResult<any>[]): FlowResult => {
    return {
      name: "Get Products",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<FlowResult> => {
    const scenarios = [
      ...(await this.validateGetProduct()),
      await this.validateGetProducts(),
      await this.validateGetProductInvalid(),
    ];

    const results = [];
    for await (const scenario of scenarios) {
      const result = await scenario.validate();
      results.push(result);
      if (!result.success && !this.config.ignoreKill) {
        break;
      }
    }
    return this.setFlow(results);
  };

  private validateGetProduct = async (): Promise<GetProductScenario[]> => {
    return this.config.getProductConfigs().map((productConfig) => {
      return new GetProductScenario({
        apiClient: this.apiClient,
        productId: productConfig.productId,
        availabilityType: productConfig.availabilityType,
        capabilities: this.config.capabilities,
      });
    });
  };
  private validateGetProducts = async (): Promise<GetProductsScenario> => {
    return new GetProductsScenario({
      apiClient: this.apiClient,
      capabilities: this.config.capabilities,
    });
  };
  private validateGetProductInvalid =
    async (): Promise<GetProductInvalidScenario> => {
      return new GetProductInvalidScenario({
        apiClient: this.apiClient,
        productId: "Invalid productId",
      });
    };
}
