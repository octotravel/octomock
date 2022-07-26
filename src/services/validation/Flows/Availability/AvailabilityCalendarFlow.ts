import { AvailabilityCalendar } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { Flow } from "../Flow";
import { AvailabilityCalendarIntervalScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarInterval";
import { AvailabilityCalendarUnavailableDatesScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarUnavailableDates";
import { AvailabilityCalendarInvalidProductScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarInvalidProduct";
import { AvailabilityCalendarInvalidOptionScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarInvalidOption";
import { AvailabilityCalendarBadRequestScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarBadRequest";

export class AvailabilityCalendarFlow {
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
    const availabilityCalendarInterval = await Promise.all(
      await this.validateAvailabilityCalendarInterval()
    );
    const availabilityCalendarUnavailableDates = await Promise.all(
      await this.validateAvailabilityCalendarUnavailableDates()
    );
    const availabilityCalendarInvalidProduct = await Promise.all(
      await this.validateAvailabilityCalendarInvalidProduct()
    );
    const availabilityCalendarInvalidOption = await Promise.all(
      await this.validateAvailabilityCalendarInvalidOption()
    );
    const availabilityCalendarBadRequest = await Promise.all(
      await this.validateAvailabilityCheckBadRequest()
    );

    const scenarios = [
      ...availabilityCalendarInterval,
      ...availabilityCalendarUnavailableDates,
      ...availabilityCalendarInvalidProduct,
      ...availabilityCalendarInvalidOption,
      ...availabilityCalendarBadRequest,
    ];
    return {
      name: "Availability Calendar",
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      success: scenarios.every((scenario) => scenario.success),
      scenarios: scenarios,
    };
  };

  private getOptionId = async (productId: string): Promise<string> => {
    const product = (
      await this.apiClient.getProduct({
        id: productId,
      })
    ).response.data.body;
    return product.options.find((option) => option.default).id;
  };

  private validateAvailabilityCalendarInterval = async (): Promise<
    Promise<ScenarioResult<AvailabilityCalendar[]>>[]
  > => {
    return this.config.getProductConfigs().map(async (availabilityConfig) => {
      return new AvailabilityCalendarIntervalScenario({
        apiClient: this.apiClient,
        productId: availabilityConfig.productId,
        optionId: availabilityConfig.optionId
          ? availabilityConfig.optionId
          : await this.getOptionId(availabilityConfig.productId),
        localDateStart: availabilityConfig.available.from,
        localDateEnd: availabilityConfig.available.to,
        capabilities: this.config.capabilities,
      }).validate();
    });
  };

  private validateAvailabilityCalendarUnavailableDates = async (): Promise<
    Promise<ScenarioResult<AvailabilityCalendar[]>>[]
  > => {
    return this.config.getProductConfigs().map(async (availabilityConfig) => {
      return new AvailabilityCalendarUnavailableDatesScenario({
        apiClient: this.apiClient,
        productId: availabilityConfig.productId,
        optionId: availabilityConfig.optionId
          ? availabilityConfig.optionId
          : await this.getOptionId(availabilityConfig.productId),
        localDateStart: availabilityConfig.unavailable.from,
        localDateEnd: availabilityConfig.unavailable.to,
        capabilities: this.config.capabilities,
      }).validate();
    });
  };

  private validateAvailabilityCalendarInvalidProduct = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return await new AvailabilityCalendarInvalidProductScenario({
          apiClient: this.apiClient,
          productId: "Invalid productId",
          optionId: availabilityConfig.optionId
            ? availabilityConfig.optionId
            : await this.getOptionId(availabilityConfig.productId),
          localDateStart: availabilityConfig.available.from,
          localDateEnd: availabilityConfig.available.to,
        }).validate();
      })
    );
  };

  private validateAvailabilityCalendarInvalidOption = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return await new AvailabilityCalendarInvalidOptionScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: "Invalid optionId",
          localDateStart: availabilityConfig.available.from,
          localDateEnd: availabilityConfig.available.to,
        }).validate();
      })
    );
  };

  private validateAvailabilityCheckBadRequest = async (): Promise<
    ScenarioResult<null>[]
  > => {
    const response = this.config
      .getProductConfigs()
      .map(async (availabilityConfig) => {
        const localDateStartBody =
          await new AvailabilityCalendarBadRequestScenario({
            apiClient: this.apiClient,
            productId: availabilityConfig.productId,
            optionId: availabilityConfig.optionId
              ? availabilityConfig.optionId
              : await this.getOptionId(availabilityConfig.productId),
            localDateStart: availabilityConfig.available.to,
          }).validate();

        const localDateEndBody =
          await new AvailabilityCalendarBadRequestScenario({
            apiClient: this.apiClient,
            productId: availabilityConfig.productId,
            optionId: availabilityConfig.optionId
              ? availabilityConfig.optionId
              : await this.getOptionId(availabilityConfig.productId),
            localDateEnd: availabilityConfig.available.from,
          }).validate();

        return [localDateStartBody, localDateEndBody];
      });
    return (await Promise.all(response)).flat(1);
  };
}
