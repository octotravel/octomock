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
import { AvailabilityErrorScenario } from "./Scenarios/Availability/AvailabilityError";
import { BookingScenario } from "./Scenarios/Booking/Booking";

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
    const unavailable = await this.validateAvailabilityNotAvailable();
    const availabilityError = await this.validateAvailabilityError();
    const scenarios = [...availability, ...unavailable, ...availabilityError];
    return {
      name: "Availability Flow",
      success: scenarios.every((scenario) => scenario.success),
      scenarios: scenarios,
    };
  };

  private validateAvailability = async (): Promise<
    Promise<ScenarioResult<Availability[]>>[]
  > => {
    return this.config.getProductConfigs().map((availabilityConfig) => {
      return new AvailabilityScenario({
        apiClient: this.apiClient,
        productId: availabilityConfig.productId,
        optionId: availabilityConfig.optionId,
        localDateStart: availabilityConfig.available.from,
        localDateEnd: availabilityConfig.available.to,
        capabilities: this.config.capabilities,
      }).validate();
    });
  };

  private validateAvailabilityNotAvailable = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config
        .getProductConfigs()
        .map(async (availabilityConfig) => {
          return await new AvailabilityNotAvailableScenario({
            apiClient: this.apiClient,
            productId: availabilityConfig.productId,
            optionId: availabilityConfig.optionId,
            localDateStart: availabilityConfig.unavailable.from,
            localDateEnd: availabilityConfig.unavailable.to,
          }).validate();
        })
        .flat(1)
    );
  };

  private validateAvailabilityError = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config
        .getProductConfigs()
        .map(async (availabilityConfig) => {
          return await new AvailabilityErrorScenario({
            apiClient: this.apiClient,
            productId: availabilityConfig.productId,
            optionId: availabilityConfig.optionId,
            availabilityIds: ["badAvailabilityID"],
          }).validate();
        })
        .flat(1)
    );
  };
}

class BookingFlow {
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
    const booking = await this.validateBooking();
    console.log(booking);
    const scenarios = [];
    return {
      name: "Booking Flow",
      success: scenarios.every((scenario) => scenario.success),
      scenarios: scenarios,
    };
  };

  private validateBooking = async (): Promise<void> => {
    const res = this.config
      .getProductConfigs()
      .map(async (availabilityConfig) => {
        const availability = await this.apiClient.getAvailability({
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          localDateStart: availabilityConfig.available.from,
          localDateEnd: availabilityConfig.available.to,
        });
        return new BookingScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          availabilityId: availability.result[0].id,
          unitItems: [],
          capabilities: [],
        });
      });
    console.log(res);
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
    const bookingFlow = await new BookingFlow({ config }).validate();
    return [supplierFlow, productFlow, availabilityFlow, bookingFlow];
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
