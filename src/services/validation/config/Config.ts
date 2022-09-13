import {
  AvailabilityType,
  Capability,
  CapabilityId,
  Product,
} from "@octocloud/types";
import * as R from "ramda";
import { ValidationEndpoint } from "../../../schemas/Validation";
import {
  ErrorType,
  ValidatorError,
} from "../../../validators/backendValidator/ValidatorHelpers";
import { ApiClient } from "../api/ApiClient";
import { ProductValidatorData } from "./ProductValidatorData";

interface IConfig {
  setCapabilities(capabilities: Capability[]): ValidatorError[];
  getCapabilityIDs(): CapabilityId[];
  setProducts(products: Product[]): ValidatorError[];
  getProduct(): Product;
  getStartTimeProducts(): ProductValidatorData;
  getOpeningHoursProducts(): ProductValidatorData;
}
export class Config implements IConfig {
  private static instance: Config;

  private endpoint: Nullable<string>;
  private apiKey: Nullable<string>;
  private backendType: Nullable<string>;

  private capabilities: CapabilityId[];

  private startTimesProducts: Nullable<ProductValidatorData>;
  private openingHoursProducts: Nullable<ProductValidatorData>;

  public invalidProductId: string;
  public invalidOptionId: string;
  public ignoreKill: boolean;

  constructor() {
    this.endpoint = null;
    this.apiKey = null;
    this.backendType = null;

    this.capabilities = [];

    this.startTimesProducts = new ProductValidatorData({
      products: [],
      availabilitySoldOut: null,
      availabilityAvailable: null,
    });
    this.openingHoursProducts = new ProductValidatorData({
      products: [],
      availabilitySoldOut: null,
      availabilityAvailable: null,
    });
    this.invalidProductId = "invalidProductId";
    this.invalidOptionId = "invalidOptionId";

    this.ignoreKill = false;
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
    this.startTimesProducts.products = products.filter(
      (product) => product.availabilityType === AvailabilityType.START_TIME
    );
    this.openingHoursProducts.products = products.filter(
      (product) => product.availabilityType === AvailabilityType.OPENING_HOURS
    );
    return [
      R.isEmpty(this.startTimesProducts.products) &&
      R.isEmpty(this.openingHoursProducts.products)
        ? new ValidatorError({
            message: "At least one product must be provided!",
            type: ErrorType.CRITICAL,
          })
        : null,
    ].filter(Boolean);
  };

  public getProduct = (): Product => {
    return !R.isEmpty(this.startTimesProducts.products)
      ? this.startTimesProducts.products[0]
      : this.openingHoursProducts.products[0];
  };

  public getStartTimeProducts = (): ProductValidatorData => {
    return this.startTimesProducts;
  };

  public getOpeningHoursProducts = (): ProductValidatorData => {
    return this.openingHoursProducts;
  };
}
