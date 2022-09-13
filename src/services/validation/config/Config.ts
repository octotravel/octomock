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
  setProducts?(products: Product[]): ValidatorError[];
  getStartTimeProducts?(): ProductValidatorData;
  getOpeningHoursProducts?(): ProductValidatorData;
  getAvailabilityRequiredFalseProducts?(): ProductValidatorData;
}
export class Config implements IConfig {
  private static instance: Config;

  private endpoint: Nullable<string>;
  private apiKey: Nullable<string>;
  private backendType: Nullable<string>;

  private capabilities: CapabilityId[];

  public startTimesProducts: Nullable<ProductValidatorData>;
  public openingHoursProducts: Nullable<ProductValidatorData>;
  public productIds: string[];

  public invalidProductId: string;

  readonly ignoreKill: boolean;

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
    this.productIds = [];
    this.invalidProductId = "invalidProductId";

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
    this.productIds = products.map((product) => product.id);
    return [
      R.isEmpty(this.productIds)
        ? new ValidatorError({
            message: "At least one product must be provided!",
            type: ErrorType.CRITICAL,
          })
        : null,
    ].filter(Boolean);
  };
}
