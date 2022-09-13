import { Scenario } from "./../../Scenarios/Scenario";
import { ApiClient } from "../../api/ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { GetProductScenario } from "../../Scenarios/Product/GetProduct";
import { GetProductInvalidScenario } from "../../Scenarios/Product/GetProductInvalid";
import { GetProductsScenario } from "../../Scenarios/Product/GetProducts";
import { Flow, FlowResult } from "../Flow";
import {
  ErrorType,
  ValidatorError,
} from "../../../../validators/backendValidator/ValidatorHelpers";
import { BaseFlow } from "../BaseFlow";

export class ProductFlow extends BaseFlow implements Flow {
  private config = Config.getInstance();
  private apiClient: ApiClient;
  constructor() {
    super("Get Products");
    this.apiClient = new ApiClient({
      url: this.config.getEndpointData().endpoint,
      apiKey: this.config.getEndpointData().apiKey,
      capabilities: this.config.getCapabilityIDs(),
    });
  }

  public validate = async (): Promise<FlowResult> => {
    if (!this.config.validProducts) {
      const scenario: ScenarioResult<unknown> = {
        name: "Products check",
        success: false,
        request: null,
        response: null,
        errors: [
          new ValidatorError({
            message: "No valid product provided",
            type: ErrorType.CRITICAL,
          }).mapError(),
        ],
      };
      return this.getFlowResult([scenario]);
    }
    const scenarios: Scenario<unknown>[] = [
      await this.validateGetProduct(),
      await this.validateGetProducts(),
      await this.validateGetProductInvalid(),
    ];

    const results: ScenarioResult<unknown>[] = [];
    for await (const scenario of scenarios) {
      const result = await scenario.validate();
      results.push(result);
      if (!result.success && !this.config.ignoreKill) {
        break;
      }
    }
    return this.getFlowResult(results);
  };

  private validateGetProduct = async (): Promise<GetProductScenario> => {
    const productIds = [
      this.config.startTimesProducts.availabilityAvailable
        ? this.config.startTimesProducts.availabilityAvailable.productId
        : null,
      this.config.openingHoursProducts.availabilityAvailable
        ? this.config.openingHoursProducts.availabilityAvailable.productId
        : null,
      this.config.availabilityRequiredFalseProducts.availabilityAvailable
        ? this.config.availabilityRequiredFalseProducts.availabilityAvailable
            .productId
        : null,
    ].filter(Boolean);
    return new GetProductScenario({
      apiClient: this.apiClient,
      productId: productIds[0],
      capabilities: this.config.getCapabilityIDs(),
    });
  };
  private validateGetProducts = async (): Promise<GetProductsScenario> => {
    return new GetProductsScenario({
      apiClient: this.apiClient,
      capabilities: this.config.getCapabilityIDs(),
    });
  };
  private validateGetProductInvalid =
    async (): Promise<GetProductInvalidScenario> => {
      return new GetProductInvalidScenario({
        apiClient: this.apiClient,
        productId: "invalid_productId",
      });
    };
}
