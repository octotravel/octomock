import { Availability, Product, Supplier } from "@octocloud/types";
import { ApiClient } from "./ApiClient";
import { Config } from "./config/Config";
import { ScenarioResult } from "./Scenario";
import { ProductScenario } from "./Scenarios/Product/Product";
import { ProductErrorScenario } from "./Scenarios/Product/ProductError";
import { SupplierScenario } from "./Scenarios/Supplier/Supplier";
import { SupplierErrorScenario } from "./Scenarios/Supplier/SupplierError";
import { AvailabilityScenario } from "./Scenarios/Availability/Availability";
import { AvailabilityNotAvailableScenario } from "./Scenarios/Availability/AvailabilityNotAvailable";

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
  public validate = async (): Promise<Flow> => {
    const supplier = await this.validateSupplier();
    const supplierError = await this.validateSupplierError();
    const scenarios = [supplier, supplierError];
    return {
      name: "Supplier Flow",
      success: scenarios.every((scenario) => scenario.success),
      scenarios: scenarios,
    };
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

class AvailabilityFlow {
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
    const availability = await Promise.all(await this.validateAvailability());
    const availabilityError = await this.validateAvailabilityNotAvailable();
    const scenarios = [...availability, ...availabilityError];
    return {
      name: "Availability Flow",
      success: scenarios.every((scenario) => scenario.success),
      scenarios: scenarios,
    };
  };

  private validateAvailability = async (): Promise<
    Promise<ScenarioResult<Availability[]>>[]
  > => {
    return this.config.getAvailabilityConfigs().map((availabilityConfig) => {
      return new AvailabilityScenario({
        apiClient: this.apiClient,
        productId: availabilityConfig.productId,
        optionId: availabilityConfig.optionId,
        localDateStart: availabilityConfig.dateFrom,
        localDateEnd: availabilityConfig.dateTo,
        capabilities: this.config.capabilities,
      }).validate();
    });
  };

  private validateAvailabilityNotAvailable = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config
        .getAvailabilityConfigs()
        .map((availabilityConfig) => {
          return availabilityConfig.datesNotAvailable.map(async (date) => {
            return await new AvailabilityNotAvailableScenario({
              apiClient: this.apiClient,
              productId: availabilityConfig.productId,
              optionId: availabilityConfig.optionId,
              localDate: date,
            }).validate();
          });
        })
        .flat(1)
    );
  };
}
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
    const supplierFlow = await new SupplierFlow({ config }).validate();
    const productFlow = await new ProductFlow({ config }).validate();
    const availabilityFlow = await new AvailabilityFlow({ config }).validate();
    return [supplierFlow, productFlow, availabilityFlow];
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
