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
import { AvailabilityIdErrorScenario } from "./Scenarios/Availability/AvailabilityIdError";
// import { BookingScenario } from "./Scenarios/Booking/Booking";
import { SuppliersScenario } from "./Scenarios/Supplier/Suppliers";
import { ProductsScenario } from "./Scenarios/Product/Products";
import { AvailabilityProductIdErrorScenario } from "./Scenarios/Availability/AvailabilityProductIdError";
import { AvailabilityOptionIdErrorScenario } from "./Scenarios/Availability/AvailabilityOptionIdError";
import { AvailabilityErrorScenario } from "./Scenarios/Availability/AvailabilityError";

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
    const suppliers = await this.validateSuppliers();
    const supplierError = await this.validateSupplierError();
    const scenarios = [supplier, suppliers, supplierError];
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
  private validateSuppliers = async (): Promise<ScenarioResult<Supplier[]>> => {
    return new SuppliersScenario({
      apiClient: this.apiClient,
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
    const products = await this.validateProducts();
    const productError = await this.validateProductError();
    const scenarios = [...product, products, productError];
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
    const availabilityIdError = await this.validateAvailabilityIdError();
    const availabilityProductIdError =
      await this.validateAvailabilityProductIdError();
    const availabilityOptionIdError =
      await this.validateAvailabilityOptionIdError();
    const availabilityError = await this.validateAvailabilityError();
    const scenarios = [
      ...availability,
      ...unavailable,
      ...availabilityIdError,
      ...availabilityProductIdError,
      ...availabilityOptionIdError,
      ...availabilityError,
    ];
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
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return await new AvailabilityNotAvailableScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          localDateStart: availabilityConfig.unavailable.from,
          localDateEnd: availabilityConfig.unavailable.to,
        }).validate();
      })
    );
  };

  private validateAvailabilityIdError = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return await new AvailabilityIdErrorScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          availabilityIds: ["badAvailabilityID"],
        }).validate();
      })
    );
  };

  private validateAvailabilityProductIdError = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return await new AvailabilityProductIdErrorScenario({
          apiClient: this.apiClient,
          productId: "bad productId",
          optionId: availabilityConfig.optionId,
          localDate: availabilityConfig.available.from,
        }).validate();
      })
    );
  };

  private validateAvailabilityOptionIdError = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return await new AvailabilityOptionIdErrorScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: "bad optionId",
          localDate: availabilityConfig.available.from,
        }).validate();
      })
    );
  };

  private validateAvailabilityError = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return await new AvailabilityErrorScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
        }).validate();
      })
    );
  };
}

// class BookingFlow {
//   private config: Config;
//   private apiClient: ApiClient;
//   constructor({ config }: { config: Config }) {
//     this.config = config;
//     this.apiClient = new ApiClient({
//       url: config.url,
//       capabilities: config.capabilities,
//     });
//   }
//   public validate = async (): Promise<Flow> => {
//     const booking = await this.validateBooking();
//     console.log(booking);
//     const scenarios = [];
//     return {
//       name: "Booking Flow",
//       success: scenarios.every((scenario) => scenario.success),
//       scenarios: scenarios,
//     };
//   };

//   private validateBooking = async (): Promise<void> => {
//     const res = this.config
//       .getProductConfigs()
//       .map(async (availabilityConfig) => {
//         const availability = await this.apiClient.getAvailability({
//           productId: availabilityConfig.productId,
//           optionId: availabilityConfig.optionId,
//           localDateStart: availabilityConfig.available.from,
//           localDateEnd: availabilityConfig.available.to,
//         });
//         return new BookingScenario({
//           apiClient: this.apiClient,
//           productId: availabilityConfig.productId,
//           optionId: availabilityConfig.optionId,
//           availabilityId: availability.result[0].id,
//           unitItems: [],
//           capabilities: [],
//         });
//       });
//     console.log(res);
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
    const supplierFlow = await new SupplierFlow({ config }).validate();
    const productFlow = await new ProductFlow({ config }).validate();
    const availabilityFlow = await new AvailabilityFlow({ config }).validate();
    // const bookingFlow = await new BookingFlow({ config }).validate();
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
