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

  private setFlow = (scenarios: ScenarioResult<any>[]): Flow => {
    const noProducts = this.config.getProductConfigs().length;
    return {
      name: "Availability Calendar",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: noProducts * 6,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<Flow> => {
    const scenarios = [];

    const availabilityCalendarInterval = await Promise.all(
      await this.validateAvailabilityCalendarInterval()
    );
    scenarios.push(...availabilityCalendarInterval);
    if (
      !availabilityCalendarInterval
        .map((scenario) => scenario.success)
        .some((status) => status)
    )
      return this.setFlow(scenarios);

    const availabilityCalendarUnavailableDates = await Promise.all(
      await this.validateAvailabilityCalendarUnavailableDates()
    );
    scenarios.push(...availabilityCalendarUnavailableDates);
    if (
      !availabilityCalendarUnavailableDates
        .map((scenario) => scenario.success)
        .some((status) => status)
    )
      return this.setFlow(scenarios);

    const availabilityCalendarInvalidProduct = await Promise.all(
      await this.validateAvailabilityCalendarInvalidProduct()
    );
    scenarios.push(...availabilityCalendarInvalidProduct);
    if (
      !availabilityCalendarInvalidProduct
        .map((scenario) => scenario.success)
        .some((status) => status)
    )
      return this.setFlow(scenarios);

    const availabilityCalendarInvalidOption = await Promise.all(
      await this.validateAvailabilityCalendarInvalidOption()
    );
    scenarios.push(...availabilityCalendarInvalidOption);
    if (
      !availabilityCalendarInvalidOption
        .map((scenario) => scenario.success)
        .some((status) => status)
    )
      return this.setFlow(scenarios);

    const availabilityCalendarBadRequest = await Promise.all(
      await this.validateAvailabilityCheckBadRequest()
    );
    scenarios.push(...availabilityCalendarBadRequest);
    if (
      !availabilityCalendarBadRequest
        .map((scenario) => scenario.success)
        .some((status) => status)
    )
      return this.setFlow(scenarios);

    return this.setFlow(scenarios);
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
        availabilityType: availabilityConfig.availabilityType,
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
        availabilityType: availabilityConfig.availabilityType,
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
