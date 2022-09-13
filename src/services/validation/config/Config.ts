import { Capability, CapabilityId, Product } from "@octocloud/types";
import { ValidationEndpoint } from "../../../schemas/Validation";
import { ValidatorError } from "../../../validators/backendValidator/ValidatorHelpers";
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
  public availabilityRequiredFalseProducts: Nullable<ProductValidatorData>;
  readonly validProducts: boolean;

  readonly ignoreKill: boolean;

  constructor() {
    this.endpoint = null;
    this.apiKey = null;
    this.backendType = null;

    this.capabilities = [];

    this.startTimesProducts = null;
    this.openingHoursProducts = null;
    this.availabilityRequiredFalseProducts = null;
    this.validProducts = false;

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

  public setCapabilities = (capabilities: Capability[]): ValidatorError[] => {
    this.capabilities = capabilities.map((capability) => {
      return capability.id;
    });
    return [new ValidatorError({ message: "tst" })];
  };

  public getCapabilityIDs = (): CapabilityId[] => {
    return this.capabilities;
  };

  // public setProducts = (products: Product[]): ValidatorError[] => {

  //   return [];
  // }
}
