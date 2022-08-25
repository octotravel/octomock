import { AvailabilityType } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { FlowResult } from "../Flow";
import { AvailabilityCalendarIntervalScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarInterval";
import { AvailabilityCalendarUnavailableDatesScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarUnavailableDates";
import { AvailabilityCalendarInvalidProductScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarInvalidProduct";
import { AvailabilityCalendarInvalidOptionScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarInvalidOption";
import { AvailabilityCalendarBadRequestScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarBadRequest";

export class AvailabilityCalendarFlow {
  private config: Config;
  private apiClient: ApiClient;
  private optionIdStartTimes: Nullable<string>;
  private optionIdOpeningHours: Nullable<string>;
  constructor({ config }: { config: Config }) {
    this.config = config;
    this.apiClient = new ApiClient({
      url: config.url,
      capabilities: config.capabilities,
      apiKey: this.config.apiKey,
    });
    this.optionIdStartTimes = null;
    this.optionIdOpeningHours = null;
  }

  public fetchData = async (): Promise<void> => {
    await Promise.all(
      this.config.getProductConfigs().map(async (productConfig) => {
        const product = await this.apiClient.getProduct({
          id: productConfig.productId,
        });
        const optionId =
          productConfig.optionId ??
          product.response.data.body.options.find((option) => option.default)
            .id;
        if (productConfig.availabilityType === AvailabilityType.START_TIME) {
          this.optionIdStartTimes = optionId;
        } else {
          this.optionIdOpeningHours = optionId;
        }
      })
    );
  };

  private setFlow = (scenarios: ScenarioResult<any>[]): FlowResult => {
    return {
      name: "Availability Calendar",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<FlowResult> => {
    await this.fetchData();

    const scenarios = [
      ...(await this.validateAvailabilityCalendarInterval()),
      ...(await this.validateAvailabilityCalendarUnavailableDates()),
      ...(await this.validateAvailabilityCalendarInvalidProduct()),
      ...(await this.validateAvailabilityCalendarInvalidOption()),
      ...(await this.validateAvailabilityCheckBadRequest()),
    ];

    const results = [];
    for await (const scenario of scenarios) {
      const result = await scenario.validate();
      results.push(result);
      if (!result.success) {
        break;
      }
    }
    return this.setFlow(results);
  };

  private validateAvailabilityCalendarInterval = async (): Promise<
    AvailabilityCalendarIntervalScenario[]
  > => {
    return this.config.getProductConfigs().map((availabilityConfig) => {
      return new AvailabilityCalendarIntervalScenario({
        apiClient: this.apiClient,
        productId: availabilityConfig.productId,
        optionId:
          availabilityConfig.availabilityType === AvailabilityType.OPENING_HOURS
            ? this.optionIdOpeningHours
            : this.optionIdStartTimes,
        localDateStart: availabilityConfig.available.from,
        localDateEnd: availabilityConfig.available.to,
        availabilityType: availabilityConfig.availabilityType,
        capabilities: this.config.capabilities,
      });
    });
  };

  private validateAvailabilityCalendarUnavailableDates = async (): Promise<
    AvailabilityCalendarUnavailableDatesScenario[]
  > => {
    return this.config.getProductConfigs().map((availabilityConfig) => {
      return new AvailabilityCalendarUnavailableDatesScenario({
        apiClient: this.apiClient,
        productId: availabilityConfig.productId,
        optionId:
          availabilityConfig.availabilityType === AvailabilityType.OPENING_HOURS
            ? this.optionIdOpeningHours
            : this.optionIdStartTimes,
        localDateStart: availabilityConfig.unavailable.from,
        localDateEnd: availabilityConfig.unavailable.to,
        availabilityType: availabilityConfig.availabilityType,
        capabilities: this.config.capabilities,
      });
    });
  };

  private validateAvailabilityCalendarInvalidProduct = async (): Promise<
    AvailabilityCalendarInvalidProductScenario[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return new AvailabilityCalendarInvalidProductScenario({
          apiClient: this.apiClient,
          productId: "Invalid productId",
          optionId:
            availabilityConfig.availabilityType ===
            AvailabilityType.OPENING_HOURS
              ? this.optionIdOpeningHours
              : this.optionIdStartTimes,
          localDateStart: availabilityConfig.available.from,
          localDateEnd: availabilityConfig.available.to,
        });
      })
    );
  };

  private validateAvailabilityCalendarInvalidOption = async (): Promise<
    AvailabilityCalendarInvalidOptionScenario[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return new AvailabilityCalendarInvalidOptionScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: "Invalid optionId",
          localDateStart: availabilityConfig.available.from,
          localDateEnd: availabilityConfig.available.to,
        });
      })
    );
  };

  private validateAvailabilityCheckBadRequest = async (): Promise<
    AvailabilityCalendarBadRequestScenario[]
  > => {
    const response = this.config
      .getProductConfigs()
      .map(async (availabilityConfig) => {
        const localDateStartBody = new AvailabilityCalendarBadRequestScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId:
            availabilityConfig.availabilityType ===
            AvailabilityType.OPENING_HOURS
              ? this.optionIdOpeningHours
              : this.optionIdStartTimes,
          localDateStart: availabilityConfig.available.to,
        });

        const localDateEndBody = new AvailabilityCalendarBadRequestScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId:
            availabilityConfig.availabilityType ===
            AvailabilityType.OPENING_HOURS
              ? this.optionIdOpeningHours
              : this.optionIdStartTimes,
          localDateEnd: availabilityConfig.available.from,
        });

        return [localDateStartBody, localDateEndBody];
      });
    return (await Promise.all(response)).flat(1);
  };
}
