import { AvailabilityStatus, AvailabilityType } from "@octocloud/types";
import { DateHelper } from "../../../helpers/DateHelper";
import { BadRequestError } from "../../../models/Error";
import { ValidationConfig } from "../../../schemas/Validation";
import { ApiClient } from "../ApiClient";
import { FlowResult } from "../Flows/Flow";
import { Config } from "./Config";
import { PreConfig } from "./PreConfig";
import { ProductValidatorData } from "./ProductValidatorData";
import { addDays } from "date-fns";

export class ConfigParser {
  public parse = async (data: ValidationConfig): Promise<PreConfig> => {
    return new PreConfig({
      url: data.backend.endpoint,
      apiKey: data.backend.apiKey,
      backendType: data.backend.type,
    });
  };

  public fetch = async (
    data: PreConfig,
    capabilitiesFlow: FlowResult
  ): Promise<Config> => {
    const capabilities = capabilitiesFlow.scenarios[0].response.body.map(
      (capability) => {
        return capability.id;
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

    const startTimesProductsOnly = products.data.body.filter(
      (product) => product.availabilityType === AvailabilityType.START_TIME
    );
    let STavailabilityAvailable = null;
    for await (const product of startTimesProductsOnly) {
      const optionId = product.options.find((option) => option.default).id;
      const availability = (
        await apiClient.getAvailability({
          productId: product.id,
          optionId,
          localDateStart: DateHelper.getDate(new Date().toISOString()),
          localDateEnd: DateHelper.getDate(
            addDays(new Date(), 30).toISOString()
          ),
        })
      ).response.data.body.find(
        (availability) => availability.status === AvailabilityStatus.AVAILABLE
      );
      if (availability) {
        STavailabilityAvailable = {
          product: product.id,
          optionId,
          availabilityId: availability.id,
        };
        break;
      }
    }
    let STavailabilitySoldOut = null;
    for await (const product of startTimesProductsOnly) {
      const optionId = product.options.find((option) => option.default).id;
      const availability = (
        await apiClient.getAvailability({
          productId: product.id,
          optionId,
          localDateStart: DateHelper.getDate(new Date().toISOString()),
          localDateEnd: DateHelper.getDate(
            addDays(new Date(), 30).toISOString()
          ),
        })
      ).response.data.body.find(
        (availability) => availability.status === AvailabilityStatus.SOLD_OUT
      );
      if (availability) {
        STavailabilitySoldOut = {
          product: product.id,
          optionId,
          availabilityId: availability.id,
        };
        break;
      }
    }

    const startTimesProducts: ProductValidatorData = {
      products: startTimesProductsOnly,
      availabilityAvailable: STavailabilityAvailable,
      availabilitySoldOut: STavailabilitySoldOut,
    };

    const openingHoursProductsOnly = products.data.body.filter(
      (product) => product.availabilityType === AvailabilityType.OPENING_HOURS
    );
    let OHavailabilityAvailable = null;
    for await (const product of openingHoursProductsOnly) {
      const optionId = product.options.find((option) => option.default).id;
      const availability = (
        await apiClient.getAvailability({
          productId: product.id,
          optionId,
          localDateStart: DateHelper.getDate(new Date().toISOString()),
          localDateEnd: DateHelper.getDate(
            addDays(new Date(), 30).toISOString()
          ),
        })
      ).response.data.body.find(
        (availability) => availability.status === AvailabilityStatus.AVAILABLE
      );
      if (availability) {
        OHavailabilityAvailable = {
          product: product.id,
          optionId,
          availabilityId: availability.id,
        };
        break;
      }
    }
    let OHavailabilitySoldOut = null;
    for await (const product of openingHoursProductsOnly) {
      const optionId = product.options.find((option) => option.default).id;
      const availability = (
        await apiClient.getAvailability({
          productId: product.id,
          optionId,
          localDateStart: DateHelper.getDate(new Date().toISOString()),
          localDateEnd: DateHelper.getDate(
            addDays(new Date(), 30).toISOString()
          ),
        })
      ).response.data.body.find(
        (availability) => availability.status === AvailabilityStatus.SOLD_OUT
      );
      if (availability) {
        OHavailabilitySoldOut = {
          product: product.id,
          optionId,
          availabilityId: availability.id,
        };
        break;
      }
    }

    const openingHoursProducts: ProductValidatorData = {
      products: openingHoursProductsOnly,
      availabilityAvailable: OHavailabilityAvailable,
      availabilitySoldOut: OHavailabilitySoldOut,
    };

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
