import {
  AvailabilityType,
  Capability,
  CapabilityId,
  Product,
} from "@octocloud/types";
import { ValidationEndpoint } from "../../../schemas/Validation";
import {
  ErrorType,
  ValidatorError,
} from "../../../validators/backendValidator/ValidatorHelpers";
import { ApiClient } from "../api/ApiClient";
import { ErrorResult, ProductValidatorData } from "./ProductValidatorData";

interface IConfig {
  setCapabilities(capabilities: Capability[]): ValidatorError[];
  getCapabilityIDs(): CapabilityId[];
  setProducts(products: Product[]): ValidatorError[];
  setAvailability(
    product: Product,
    availabilityIdAvailable: string[],
    availabilityIdSoldOut: string
  ): void;
  getProduct(): Product;
  getProducts(availabilityType?: AvailabilityType): Product[];
  getStartTimeProducts(): ProductValidatorData[];
  getOpeningHoursProducts(): ProductValidatorData[];
  getBookingProduct(): ErrorResult<ProductValidatorData>;
}
export class Config implements IConfig {
  private static instance: Config;

  private endpoint: Nullable<string>;
  private apiKey: Nullable<string>;
  private backendType: Nullable<string>;

  private capabilities: CapabilityId[];

  private products: Product[];
  private startTimesProducts: ProductValidatorData[];
  private openingHoursProducts: ProductValidatorData[];

  public invalidProductId: string;
  public invalidOptionId: string;
  public ignoreKill: boolean;

  constructor() {
    this.endpoint = null;
    this.apiKey = null;
    this.backendType = null;

    this.capabilities = [];

    this.products = [];
    this.startTimesProducts = [];
    this.openingHoursProducts = [];
    this.invalidProductId = "invalidProductId";
    this.invalidOptionId = "invalidOptionId";

    this.ignoreKill = true;
  }

  public static getInstance = (): Config => {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  };

  public init = (data: ValidationEndpoint): void => {
    this.endpoint = data.backend.endpoint;
    this.apiKey = data.backend.apiKey;
    this.backendType = data.backend.type;
  };

  public getEndpointData = (): {
    endpoint: string;
    apiKey: string;
    backendType: string;
  } => {
    return {
      endpoint: this.endpoint,
      apiKey: this.apiKey,
      backendType: this.backendType,
    };
  };

  public getApiClient = (): ApiClient => {
    return new ApiClient({
      url: this.endpoint,
      apiKey: this.apiKey,
      capabilities: this.getCapabilityIDs(),
    });
  };

  public setCapabilities = (capabilities: Capability[]): ValidatorError[] => {
    this.capabilities = capabilities.map((capability) => {
      return capability.id;
    });
    return [];
  };

  public getCapabilityIDs = (): CapabilityId[] => {
    return this.capabilities;
  };

  public setProducts = (products: Product[]): ValidatorError[] => {
    this.products = products;
    return [];
  };

  public setAvailability = (
    product: Product,
    availabilityIdAvailable: string[],
    availabilityIdSoldOut: string
  ): void => {
    if (product.availabilityType === AvailabilityType.START_TIME) {
      this.startTimesProducts.push(
        new ProductValidatorData({
          product,
          availabilityIdAvailable,
          availabilityIdSoldOut,
        })
      );
    }

    if (product.availabilityType === AvailabilityType.OPENING_HOURS) {
      this.openingHoursProducts.push(
        new ProductValidatorData({
          product,
          availabilityIdAvailable,
          availabilityIdSoldOut,
        })
      );
    }
  };

  public getProduct = (availabilityType?: AvailabilityType): Product => {
    if (availabilityType) {
      if (availabilityType === AvailabilityType.START_TIME) {
        return this.products.filter(
          (product) => product.availabilityType === AvailabilityType.START_TIME
        )[0];
      }
    }
    return this.products[0];
  };

  public getProducts = (availabilityType?: AvailabilityType): Product[] => {
    if (availabilityType) {
      return this.products.filter(
        (product) => product.availabilityType === availabilityType
      );
    }
    return this.products;
  };

  public getStartTimeProducts = (): ProductValidatorData[] => {
    return this.startTimesProducts;
  };

  public getOpeningHoursProducts = (): ProductValidatorData[] => {
    return this.openingHoursProducts;
  };

  public getBookingProduct = (): ErrorResult<ProductValidatorData> => {
    const products = [...this.startTimesProducts, ...this.openingHoursProducts];

    const product =
      products.find(
        (p) =>
          p.getAvailabilityIDAvailable().length > 1 &&
          p.getAvailabilityIDSoldOut().length > 0 &&
          p.getOption()
      ) ?? null;

    if (product === null) {
      return {
        error: new ValidatorError({
          type: ErrorType.CRITICAL,
          message: "there is no suitable product",
        }),
        data: null,
      };
    }
    return {
      error: null,
      data: product,
    };
  };
}
