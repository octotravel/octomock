import { AvailabilityType } from "@octocloud/types";
import { eachDayOfInterval } from "date-fns";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { AvailabilityCheckIntervalScenario } from "../../Scenarios/Availability/AvailabilityCheckInterval";
import { AvailabilityCheckDateScenario } from "../../Scenarios/Availability/AvailabilityCheckDate";
import { FlowResult } from "../Flow";
import { DateHelper } from "../../../../helpers/DateHelper";
import { AvailabilityCheckUnavailableDatesScenario } from "../../Scenarios/Availability/AvailabilityCheckUnavailableDates";
import { AvailabilityCheckInvalidProductScenario } from "../../Scenarios/Availability/AvailabilityCheckInvalidProduct";
import { AvailabilityCheckInvalidOptionScenario } from "../../Scenarios/Availability/AvailabilityCheckInvalidOption";
import { AvailabilityCheckBadRequestScenario } from "../../Scenarios/Availability/AvailabilityCheckBadRequest";
import { AvailabilityCheckAvailabilityIdScenario } from "../../Scenarios/Availability/AvailabilityCheckAvailabilityId";
import { BadRequestError } from "../../../../models/Error";
import R from "ramda";

export class AvailabilityFlow {
  public config: Config;
  public apiClient: ApiClient;
  public optionIdStartTimes: Nullable<string>;
  public optionIdOpeningHours: Nullable<string>;
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

  private fetchData = async (): Promise<void> => {
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
      name: "Availability Check",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<FlowResult> => {
    await this.fetchData();

    const scenarios = [
      ...(await this.validateAvailabilityCheckInterval()),
      ...(await this.validateAvailabilityCheckDate()),
      ...(await this.validateAvailabilityCheckAvailabilityId()),
      ...(await this.validateAvailabilityCheckUnavailableDates()),
      ...(await this.validateAvailabilityCheckInvalidProduct()),
      ...(await this.validateAvailabilityCheckInvalidOption()),
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

  private validateAvailabilityCheckInterval = async (): Promise<
    AvailabilityCheckIntervalScenario[]
  > => {
    return this.config.getProductConfigs().map((availabilityConfig) => {
      return new AvailabilityCheckIntervalScenario({
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

  private validateAvailabilityCheckDate = async (): Promise<
    AvailabilityCheckDateScenario[]
  > => {
    return this.config.getProductConfigs().map((availabilityConfig) => {
      const dates = eachDayOfInterval({
        start: new Date(availabilityConfig.available.from),
        end: new Date(availabilityConfig.available.to),
      }).map((date) => {
        return DateHelper.availabilityDateFormat(date);
      });
      return new AvailabilityCheckDateScenario({
        apiClient: this.apiClient,
        productId: availabilityConfig.productId,
        optionId:
          availabilityConfig.availabilityType === AvailabilityType.OPENING_HOURS
            ? this.optionIdOpeningHours
            : this.optionIdStartTimes,
        localDate: dates[Math.floor(Math.random() * dates.length)],
        availabilityType: availabilityConfig.availabilityType,
        capabilities: this.config.capabilities,
      });
    });
  };

  private validateAvailabilityCheckAvailabilityId = async (): Promise<
    AvailabilityCheckAvailabilityIdScenario[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        const dates = eachDayOfInterval({
          start: new Date(availabilityConfig.available.from),
          end: new Date(availabilityConfig.available.to),
        }).map((date) => {
          return DateHelper.availabilityDateFormat(date);
        });
        const availability = (
          await this.apiClient.getAvailability({
            productId: availabilityConfig.productId,
            optionId:
              availabilityConfig.availabilityType ===
              AvailabilityType.OPENING_HOURS
                ? this.optionIdOpeningHours
                : this.optionIdStartTimes,
            localDate: dates[Math.floor(Math.random() * dates.length)],
          })
        ).response.data.body;
        if (R.isEmpty(availability)) {
          throw new BadRequestError("Invalid available dates!");
        }
        return new AvailabilityCheckAvailabilityIdScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId:
            availabilityConfig.availabilityType ===
            AvailabilityType.OPENING_HOURS
              ? this.optionIdOpeningHours
              : this.optionIdStartTimes,
          availabilityType: availabilityConfig.availabilityType,
          availabilityIds: [availability[0].id],
          capabilities: this.config.capabilities,
        });
      })
    );
  };

  private validateAvailabilityCheckUnavailableDates = async (): Promise<
    AvailabilityCheckUnavailableDatesScenario[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map((availabilityConfig) => {
        return new AvailabilityCheckUnavailableDatesScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId:
            availabilityConfig.availabilityType ===
            AvailabilityType.OPENING_HOURS
              ? this.optionIdOpeningHours
              : this.optionIdStartTimes,
          localDateStart: availabilityConfig.unavailable.from,
          localDateEnd: availabilityConfig.unavailable.to,
          availabilityType: availabilityConfig.availabilityType,
          capabilities: this.config.capabilities,
        });
      })
    );
  };

  private validateAvailabilityCheckInvalidProduct = async (): Promise<
    AvailabilityCheckInvalidProductScenario[]
  > => {
    return this.config.getProductConfigs().map((availabilityConfig) => {
      return new AvailabilityCheckInvalidProductScenario({
        apiClient: this.apiClient,
        productId: "Invalid productId",
        optionId:
          availabilityConfig.availabilityType === AvailabilityType.OPENING_HOURS
            ? this.optionIdOpeningHours
            : this.optionIdStartTimes,
        localDate: availabilityConfig.available.from,
      });
    });
  };

  private validateAvailabilityCheckInvalidOption = async (): Promise<
    AvailabilityCheckInvalidOptionScenario[]
  > => {
    return this.config.getProductConfigs().map((availabilityConfig) => {
      return new AvailabilityCheckInvalidOptionScenario({
        apiClient: this.apiClient,
        productId: availabilityConfig.productId,
        optionId: "Invalid optionId",
        localDate: availabilityConfig.available.from,
      });
    });
  };

  private validateAvailabilityCheckBadRequest = async (): Promise<
    AvailabilityCheckBadRequestScenario[]
  > => {
    const response = this.config
      .getProductConfigs()
      .map(async (availabilityConfig) => {
        const emptyBody = new AvailabilityCheckBadRequestScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId:
            availabilityConfig.availabilityType ===
            AvailabilityType.OPENING_HOURS
              ? this.optionIdOpeningHours
              : this.optionIdStartTimes,
        });

        const allDatesBody = new AvailabilityCheckBadRequestScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId:
            availabilityConfig.availabilityType ===
            AvailabilityType.OPENING_HOURS
              ? this.optionIdOpeningHours
              : this.optionIdStartTimes,
          localDate: availabilityConfig.available.from,
          localDateStart: availabilityConfig.available.to,
          localDateEnd: availabilityConfig.available.from,
        });

        const localDateAvailabilityIdsBody =
          new AvailabilityCheckBadRequestScenario({
            apiClient: this.apiClient,
            productId: availabilityConfig.productId,
            optionId:
              availabilityConfig.availabilityType ===
              AvailabilityType.OPENING_HOURS
                ? this.optionIdOpeningHours
                : this.optionIdStartTimes,
            localDate: availabilityConfig.available.from,
            availabilityIds: ["Random availability ids"],
          });

        const datesAvailabilityIdsBody =
          new AvailabilityCheckBadRequestScenario({
            apiClient: this.apiClient,
            productId: availabilityConfig.productId,
            optionId:
              availabilityConfig.availabilityType ===
              AvailabilityType.OPENING_HOURS
                ? this.optionIdOpeningHours
                : this.optionIdStartTimes,
            localDateStart: availabilityConfig.available.from,
            localDateEnd: availabilityConfig.available.to,
            availabilityIds: ["Random availability ids"],
          });

        return [
          emptyBody,
          allDatesBody,
          localDateAvailabilityIdsBody,
          datesAvailabilityIdsBody,
        ];
      });
    return (await Promise.all(response)).flat(1);
  };
}
