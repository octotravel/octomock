import { Availability } from "@octocloud/types";
import { eachDayOfInterval } from "date-fns";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { AvailabilityCheckIntervalScenario } from "../../Scenarios/Availability/AvailabilityCheckInterval";
import { AvailabilityCheckDateScenario } from "../../Scenarios/Availability/AvailabilityCheckDate";
import { Flow } from "../Flow";
import { DateHelper } from "../../../../helpers/DateHelper";
import { AvailabilityCheckUnavailableDatesScenario } from "../../Scenarios/Availability/AvailabilityCheckUnavailableDates";
import { AvailabilityCheckInvalidProductScenario } from "../../Scenarios/Availability/AvailabilityCheckInvalidProduct";
import { AvailabilityCheckInvalidOptionScenario } from "../../Scenarios/Availability/AvailabilityCheckInvalidOption";
import { AvailabilityCheckBadRequestScenario } from "../../Scenarios/Availability/AvailabilityCheckBadRequest";

export class AvailabilityFlow {
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
      name: "Availability Check",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: noProducts * 9,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<Flow> => {
    const scenarios = [];
    const availabilityCheckInterval = await Promise.all(
      await this.validateAvailabilityCheckInterval()
    );
    scenarios.push(...availabilityCheckInterval);
    if (
      !availabilityCheckInterval
        .map((scenario) => scenario.success)
        .some((status) => status)
    )
      return this.setFlow(scenarios);

    const availabilityCheckDate = await Promise.all(
      await this.validateAvailabilityCheckDate()
    );
    scenarios.push(...availabilityCheckDate);
    if (
      !availabilityCheckDate
        .map((scenario) => scenario.success)
        .some((status) => status)
    )
      return this.setFlow(scenarios);

    // const availabilityCheckAvailabilityId = await Promise.all(await this.validateAvailabilityCheckAvailabilityId());

    const availabilityCheckUnavailableDates =
      await this.validateAvailabilityCheckUnavailableDates();
    scenarios.push(...availabilityCheckUnavailableDates);
    if (
      !availabilityCheckUnavailableDates
        .map((scenario) => scenario.success)
        .some((status) => status)
    )
      return this.setFlow(scenarios);

    const availabilityCheckInvalidProduct =
      await this.validateAvailabilityCheckInvalidProduct();
    scenarios.push(...availabilityCheckInvalidProduct);
    if (
      !availabilityCheckInvalidProduct
        .map((scenario) => scenario.success)
        .some((status) => status)
    )
      return this.setFlow(scenarios);

    const availabilityCheckInvalidOption =
      await this.validateAvailabilityCheckInvalidOption();
    scenarios.push(...availabilityCheckInvalidOption);
    if (
      !availabilityCheckInvalidOption
        .map((scenario) => scenario.success)
        .some((status) => status)
    )
      return this.setFlow(scenarios);

    const availabilityCheckBadRequest =
      await this.validateAvailabilityCheckBadRequest();
    scenarios.push(...availabilityCheckBadRequest);
    if (
      !availabilityCheckBadRequest
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

  private validateAvailabilityCheckInterval = async (): Promise<
    Promise<ScenarioResult<Availability[]>>[]
  > => {
    return this.config.getProductConfigs().map(async (availabilityConfig) => {
      return new AvailabilityCheckIntervalScenario({
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

  private validateAvailabilityCheckDate = async (): Promise<
    Promise<ScenarioResult<Availability[]>>[]
  > => {
    return this.config.getProductConfigs().map(async (availabilityConfig) => {
      const dates = eachDayOfInterval({
        start: new Date(availabilityConfig.available.from),
        end: new Date(availabilityConfig.available.to),
      }).map((date) => {
        return DateHelper.availabilityDateFormat(date);
      });
      return new AvailabilityCheckDateScenario({
        apiClient: this.apiClient,
        productId: availabilityConfig.productId,
        optionId: availabilityConfig.optionId
          ? availabilityConfig.optionId
          : await this.getOptionId(availabilityConfig.productId),
        localDate: dates[Math.floor(Math.random() * dates.length)],
        availabilityType: availabilityConfig.availabilityType,
        capabilities: this.config.capabilities,
      }).validate();
    });
  };

  // private validateAvailabilityCheckAvailabilityId = async (): Promise<
  //   Promise<ScenarioResult<Availability[]>>[]
  // > => {
  //   return this.config.getProductConfigs().map(async (availabilityConfig) => {
  //     const dates = eachDayOfInterval({
  //       start: new Date(availabilityConfig.available.from),
  //       end: new Date(availabilityConfig.available.to),
  //     }).map((date) => {
  //       return DateHelper.availabilityDateFormat(date);
  //     });
  //     const availability = (await this.apiClient.getAvailability({
  //       productId: availabilityConfig.productId,
  //       optionId: availabilityConfig.optionId
  //       ? availabilityConfig.optionId
  //       : await this.getOptionId(availabilityConfig.productId),
  //       localDate: dates[Math.floor(Math.random() * dates.length)],
  //     })).response.data.body;
  //     if (R.isEmpty(availability)) {
  //       throw new BadRequestError('Invalid available dates!')
  //     }
  //     return new AvailabilityCheckAvailabilityIdScenario({
  //       apiClient: this.apiClient,
  //       productId: availabilityConfig.productId,
  //       optionId: availabilityConfig.optionId
  //         ? availabilityConfig.optionId
  //         : await this.getOptionId(availabilityConfig.productId),
  //       availabilityIds: [availability[0].id],
  //       capabilities: this.config.capabilities,
  //     }).validate();
  //   });
  // };

  private validateAvailabilityCheckUnavailableDates = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return await new AvailabilityCheckUnavailableDatesScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId
            ? availabilityConfig.optionId
            : await this.getOptionId(availabilityConfig.productId),
          localDateStart: availabilityConfig.unavailable.from,
          localDateEnd: availabilityConfig.unavailable.to,
          availabilityType: availabilityConfig.availabilityType,
        }).validate();
      })
    );
  };

  private validateAvailabilityCheckInvalidProduct = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return await new AvailabilityCheckInvalidProductScenario({
          apiClient: this.apiClient,
          productId: "Invalid productId",
          optionId: availabilityConfig.optionId
            ? availabilityConfig.optionId
            : await this.getOptionId(availabilityConfig.productId),
          localDate: availabilityConfig.available.from,
        }).validate();
      })
    );
  };

  private validateAvailabilityCheckInvalidOption = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return await new AvailabilityCheckInvalidOptionScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: "Invalid optionId",
          localDate: availabilityConfig.available.from,
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
        const emptyBody = await new AvailabilityCheckBadRequestScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId
            ? availabilityConfig.optionId
            : await this.getOptionId(availabilityConfig.productId),
        }).validate();

        const allDatesBody = await new AvailabilityCheckBadRequestScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId
            ? availabilityConfig.optionId
            : await this.getOptionId(availabilityConfig.productId),
          localDate: availabilityConfig.available.from,
          localDateStart: availabilityConfig.available.to,
          localDateEnd: availabilityConfig.available.from,
        }).validate();

        const localDateAvailabilityIdsBody =
          await new AvailabilityCheckBadRequestScenario({
            apiClient: this.apiClient,
            productId: availabilityConfig.productId,
            optionId: availabilityConfig.optionId
              ? availabilityConfig.optionId
              : await this.getOptionId(availabilityConfig.productId),
            localDate: availabilityConfig.available.from,
            availabilityIds: ["Random availability ids"],
          }).validate();

        const datesAvailabilityIdsBody =
          await new AvailabilityCheckBadRequestScenario({
            apiClient: this.apiClient,
            productId: availabilityConfig.productId,
            optionId: availabilityConfig.optionId
              ? availabilityConfig.optionId
              : await this.getOptionId(availabilityConfig.productId),
            localDateStart: availabilityConfig.available.from,
            localDateEnd: availabilityConfig.available.to,
            availabilityIds: ["Random availability ids"],
          }).validate();

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
