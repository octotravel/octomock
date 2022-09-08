import {
  AvailabilityStatus,
  AvailabilityType,
  Product,
} from "@octocloud/types";
import { DateHelper } from "../../../helpers/DateHelper";
import { BadRequestError } from "../../../models/Error";
import { ValidationConfig } from "../../../schemas/Validation";
import { ApiClient } from "../ApiClient";
import { FlowResult } from "../Flows/Flow";
import { Config } from "./Config";
import { PreConfig } from "./PreConfig";
import { addDays } from "date-fns";

export class ConfigParser {
  public parse = async (data: ValidationConfig): Promise<PreConfig> => {
    return new PreConfig({
      url: data.backend.endpoint,
      apiKey: data.backend.apiKey,
      backendType: data.backend.type,
    });
  };

  private getAvailabilities = async (
    apiClient: ApiClient,
    products: Product[],
    availabilityStatus: AvailabilityStatus
  ) => {
    for await (const product of products) {
      const defaultOption = product.options.find((option) => option.default);
      if (!defaultOption) {
        throw new BadRequestError("Atleast one option must be default");
      }
      const availability = (
        await apiClient.getAvailability({
          productId: product.id,
          optionId: defaultOption.id,
          localDateStart: DateHelper.getDate(new Date().toISOString()),
          localDateEnd: DateHelper.getDate(
            addDays(new Date(), 30).toISOString()
          ),
        })
      ).response.data.body.find(
        (availability) => availability.status === availabilityStatus
      );
      if (availability) {
        return {
          productId: product.id,
          optionId: defaultOption.id,
          availabilityId: availability.id,
        };
      }
    }
  };

  private getProducts = async (
    apiClient: ApiClient,
    products: Product[],
    availabilityType: AvailabilityType
  ) => {
    const filteredProducts = products.filter(
      (product) => product.availabilityType === availabilityType
    );
    const availabilityAvailable = await this.getAvailabilities(
      apiClient,
      filteredProducts,
      AvailabilityStatus.AVAILABLE
    );

    const availabilitySoldOut = await this.getAvailabilities(
      apiClient,
      filteredProducts,
      AvailabilityStatus.SOLD_OUT
    );

    return {
      products: filteredProducts,
      availabilityAvailable,
      availabilitySoldOut,
    };
  };

  public fetch = async (
    data: PreConfig,
    capabilitiesFlow: FlowResult
  ): Promise<Config> => {
    const capabilities = capabilitiesFlow.scenarios[0].response.body.map(
      (capability) => {
        if (capability.id) {
          return capability.id;
        }
      }
    );

    const apiClient = new ApiClient({
      capabilities,
      url: data.url,
      apiKey: data.apiKey,
    });

    const products = (await apiClient.getProducts()).response;
    if (products.error) {
      throw new BadRequestError("Invalid products");
    }

    const startTimesProducts = await this.getProducts(
      apiClient,
      products.data.body,
      AvailabilityType.START_TIME
    );
    console.log("post1");

    const openingHoursProducts = await this.getProducts(
      apiClient,
      products.data.body,
      AvailabilityType.START_TIME
    );
    console.log("post2");

    return new Config({
      url: data.url,
      apiKey: data.apiKey,
      capabilities,
      startTimesProducts,
      openingHoursProducts,
      ignoreKill: true,
    });
  };
}
