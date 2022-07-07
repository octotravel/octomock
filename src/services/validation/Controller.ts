import { Product, Supplier } from "@octocloud/types";
import { ApiClient } from "./ApiClient";
import { Config } from "./config/Config";
import { ScenarioResult } from "./Scenario";
import { ProductScenario } from "./Scenarios/Product/Product";
import { ProductErrorScenario } from "./Scenarios/Product/ProductError";
import { SupplierScenario } from "./Scenarios/Supplier/Supplier";
import { SupplierErrorScenario } from "./Scenarios/Supplier/SupplierError";

class SupplierFlow {
  private config: Config;
  private apiClient: ApiClient;
  constructor({ config }: { config: Config }) {
    this.config = config;
    this.apiClient = new ApiClient({
      url: config.url,
      capabilities: config.capabilities,
    });
  }
  public validate = async (): Promise<ScenarioResult<Supplier>[]> => {
    const supplier = await this.validateSupplier();
    const supplierError = await this.validateSupplierError();
    return [supplier, supplierError];
  };

  private validateSupplier = async (): Promise<ScenarioResult<Supplier>> => {
    return new SupplierScenario({
      apiClient: this.apiClient,
      supplierId: this.config.supplierId,
    }).validate();
  };
  private validateSupplierError = async (): Promise<ScenarioResult<null>> => {
    return new SupplierErrorScenario({
      apiClient: this.apiClient,
      supplierId: "badSupplierID",
    }).validate();
  };
}

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
  public validate = async (): Promise<ScenarioResult<any>[]> => {
    const product = await Promise.all(await this.validateProduct());
    const productError = await this.validateProductError();
    return [...product, productError];
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

class PrimiteFlows {
  private config: Config;
  constructor({ config }: { config: Config }) {
    this.config = config;
  }
  public validate = async (): Promise<ScenarioResult<any>[]> => {
    const config = this.config;
    await new SupplierFlow({ config }).validate();
    return [
      ...(await new SupplierFlow({ config }).validate()),
      ...(await new ProductFlow({ config }).validate()),
    ];
  };
}

export class ValidationController {
  private config: Config;
  constructor({ config }: { config: Config }) {
    this.config = config;
  }

  public validate = async (): Promise<ScenarioResult<any>[]> => {
    const config = this.config;
    // validateProduct
    const primitiveFlows = await new PrimiteFlows({ config }).validate();

    // new ComplextFlows().validate()
    // const { data } await ProductScenario().validate()
    // const productId = data.id
    return [...primitiveFlows];
  };
}
