import { ProductConfig } from "./ProductConfig";
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
import { ErrorResult, ProductValidatorData } from "./ProductValidatorData";
import { DateHelper } from "../../../helpers/DateHelper";
import { addDays } from "date-fns";

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
  getProducts(availabilityType?: AvailabilityType): ErrorResult<Product[]>;
  getStartTimeProducts(): ProductValidatorData[];
  getOpeningHoursProducts(): ProductValidatorData[];
  getBookingProduct(): ErrorResult<ProductValidatorData>;
}
export class Config implements IConfig {
  private static instance: Config;

  private endpoint: Nullable<string>;
  private apiKey: Nullable<string>;

  private capabilities: CapabilityId[];

  private startTimesProducts: ProductValidatorData[];
  private openingHoursProducts: ProductValidatorData[];

  public invalidProductId = "invalidProductId";
  public invalidOptionId = "invalidOptionId";
  public invalidAvailabilityId = "invalidAvailabilityId";
  public invalidUUID = "invalidUUID";
  public note = "Test Note";
  public ignoreKill: boolean;

  public localDateStart = DateHelper.getDate(new Date().toISOString());
  public localDateEnd = DateHelper.getDate(
    addDays(new Date(), 30).toISOString()
  );

  public readonly productConfig = new ProductConfig();

  constructor() {
    this.endpoint = null;
    this.apiKey = null;

    this.capabilities = [];

    this.startTimesProducts = [];
    this.openingHoursProducts = [];

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
    if (this.productConfig.invalidDataProvided) {
      this.ignoreKill = false;
    }

    return this.productConfig.setProducts(products);
  };

  public setAvailability = (
    product: Product,
    availabilityIdAvailable: [string, string],
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
        const products = this.productConfig.products.filter(
          (product) => product.availabilityType === AvailabilityType.START_TIME
        );
        return products[0];
        // if (R.isEmpty(products)) {
        //   return {
        //     error: new ValidatorError({
        //       type: ErrorType.CRITICAL,
        //       message: "there is no suitable product",
        //     }),
        //     data: null,
        //   };
        // }
        // return {
        // data: products[0],
        // error: null,
        // };
      }
      // }
      // if (R.isEmpty(this.products)) {
      //   return {
      //     error: new ValidatorError({
      //       type: ErrorType.CRITICAL,
      //       message: "there is no suitable product",
      //     }),
      //     data: null,
      //   };
      // }
      // return {
      //   data: this.products[0],
      //   error: null,
      // };
    }
    return this.productConfig.products[0];
  };

  public getProducts = (
    availabilityType?: AvailabilityType
  ): ErrorResult<Product[]> => {
    if (availabilityType) {
      const products = this.productConfig.products.filter(
        (product) => product.availabilityType === availabilityType
      );
      if (R.isEmpty(products)) {
        return {
          data: null,
          error: new ValidatorError({
            type: ErrorType.WARNING,
            message: `There is no product with availabilityType=${availabilityType}`,
          }),
        };
      }
      return;
    }
    return {
      data: this.productConfig.products,
      error: null,
    };
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
