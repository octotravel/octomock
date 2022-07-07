import { ProductErrorScenario } from "./Scenarios/Product/ProductError";
import { Product } from "@octocloud/types";
import { ApiClient } from "./ApiClient";
import { Config } from "./config/Config";
import { ProductScenario } from "./Scenarios/Product/Product";
import { ScenarioResult } from "./Scenario";

class ProductFlow {
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
    const productError = await this.validateProductError();
    const scenarios = [...product, productError];
    return {
      name: "Product Flow",
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
  private validateProductError = async (): Promise<ScenarioResult<null>> => {
    return new ProductErrorScenario({
      apiClient: this.apiClient,
      productId: "badProductID",
    }).validate();
  };
}

// class AvailabilityFlow {
//   private config: Config;
//   private apiClient: ApiClient;
//   constructor({ config }: { config: Config }) {
//     this.config = config;
//     this.apiClient = new ApiClient({
//       url: config.url,
//       capabilities: config.capabilities,
//     });
//   }
//   public validate = async (): Promise<ScenarioResult<any>[]> => {
//     const product =  await Promise.all(await this.validateAvailability());
//     const productError = await this.validateProductError();
//     return [
//       ...product,
//       productError,
//     ]
//   };

//   private validateAvailability = async (): Promise<
//     Promise<ScenarioResult<Availability>>[]
//   > => {
//     return this.config.getProductConfigs().map((productConfig) => {
//       return new ProductScenario({
//         apiClient: this.apiClient,
//         productId: productConfig.productId,
//         capabilities: this.config.capabilities,
//       }).validate();
//     });
//   };
//   private validateProductError = async (): Promise<ScenarioResult<null>> => {
//     return new ProductErrorScenario({
//       apiClient: this.apiClient,
//       productId: "badProductID",
//     }).validate();
//   };
// }

interface Flow {
  name: string;
  success: boolean;
  scenarios: ScenarioResult<any>[];
}
class PrimiteFlows {
  private config: Config;
  constructor({ config }: { config: Config }) {
    this.config = config;
  }
  public validate = async (): Promise<Flow[]> => {
    const config = this.config;
    const productFlow = await new ProductFlow({ config }).validate();
    return [productFlow];
    // new AvailabilityFlow().validate()
  };
}

export class ValidationController {
  private config: Config;
  constructor({ config }: { config: Config }) {
    this.config = config;
  }

  public validate = async (): Promise<Flow[]> => {
    const config = this.config;
    // validateProduct
    const primitiveFlows = await new PrimiteFlows({ config }).validate();

    // new ComplextFlows().validate()
    // const { data } await ProductScenario().validate()
    // const productId = data.id
    return [...primitiveFlows];
  };
}
