import { Capability, CapabilityId, Product } from "@octocloud/types";
import { ValidatorError } from "../../../validators/backendValidator/ValidatorHelpers";
import { ProductValidatorData } from "./ProductValidatorData";

interface IConfig {
  setCapabilities?(capabilities: Capability[]): ValidatorError[];
  getCapabilityIDs?(): CapabilityId[];
  setProducts?(products: Product[]): ValidatorError[];
  getStartTimeProducts?(): unknown;
  getOpeningHoursProducts?(): unknown;
  getAvailabilityRequiredFalseProducts?(): unknown;
}
export class Config implements IConfig {
  readonly endpoint: string;
  readonly apiKey: string;
  readonly backendType: string;

  private capabilities: CapabilityId[];

  public startTimesProducts: ProductValidatorData;
  public openingHoursProducts: ProductValidatorData;
  public availabilityRequiredFalseProducts: ProductValidatorData;
  readonly validProducts: boolean;

  readonly ignoreKill: boolean;

  constructor({
    endpoint,
    apiKey,
    backendType,
  }: {
    endpoint: string;
    apiKey: string;
    backendType: string;
  }) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.backendType = backendType;

    this.capabilities = [];

    this.startTimesProducts = null;
    this.openingHoursProducts = null;
    this.availabilityRequiredFalseProducts = null;
    this.validProducts = false;

    this.ignoreKill = true;
  }
  public setCapabilities = (capabilities: Capability[]): ValidatorError[] => {
    this.capabilities = capabilities.map((capability) => {
      return capability.id;
    });
    return [];
  };

  public getCapabilityIDs = (): CapabilityId[] => {
    return this.capabilities;
  };
}
