import { Availability } from "@octocloud/types";
import { eachDayOfInterval } from "date-fns";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { AvailabilityCheckIntervalScenario } from "../../Scenarios/Availability/AvailabilityCheckInterval";
import { AvailabilityCheckDateScenario } from "../../Scenarios/Availability/AvailabilityCheckDate";
// import { AvailabilityErrorScenario } from "../../Scenarios/Availability/AvailabilityError";
// import { AvailabilityIdErrorScenario } from "../../Scenarios/Availability/AvailabilityIdError";
// import { AvailabilityNotAvailableScenario } from "../../Scenarios/Availability/AvailabilityNotAvailable";
// import { AvailabilityOptionIdErrorScenario } from "../../Scenarios/Availability/AvailabilityOptionIdError";
// import { AvailabilityProductIdErrorScenario } from "../../Scenarios/Availability/AvailabilityProductIdError";
import { Flow } from "../Flow";
import { DateHelper } from "../../../../helpers/DateHelper";

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
  public validate = async (): Promise<Flow> => {
    const availabilityCheckInterval = await Promise.all(
      await this.validateAvailabilityCheckInterval()
    );
    const availabilityCheckDate = await Promise.all(
      await this.validateAvailabilityCheckDate()
    );
    // const unavailable = await this.validateAvailabilityNotAvailable();
    // const availabilityIdError = await this.validateAvailabilityIdError();
    // const availabilityProductIdError =
    //   await this.validateAvailabilityProductIdError();
    // const availabilityOptionIdError =
    //   await this.validateAvailabilityOptionIdError();
    // const availabilityError = await this.validateAvailabilityError();
    const scenarios = [
      ...availabilityCheckInterval,
      ...availabilityCheckDate,
      //   ...unavailable,
      //   ...availabilityIdError,
      //   ...availabilityProductIdError,
      //   ...availabilityOptionIdError,
      //   ...availabilityError,
    ];
    return {
      name: "Availability Check",
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
        capabilities: this.config.capabilities,
      }).validate();
    });
  };

  //   private validateAvailabilityNotAvailable = async (): Promise<
  //     ScenarioResult<null>[]
  //   > => {
  //     return Promise.all(
  //       this.config.getProductConfigs().map(async (availabilityConfig) => {
  //         return await new AvailabilityNotAvailableScenario({
  //           apiClient: this.apiClient,
  //           productId: availabilityConfig.productId,
  //           optionId: availabilityConfig.optionId,
  //           localDateStart: availabilityConfig.unavailable.from,
  //           localDateEnd: availabilityConfig.unavailable.to,
  //         }).validate();
  //       })
  //     );
  //   };

  //   private validateAvailabilityIdError = async (): Promise<
  //     ScenarioResult<null>[]
  //   > => {
  //     return Promise.all(
  //       this.config.getProductConfigs().map(async (availabilityConfig) => {
  //         return await new AvailabilityIdErrorScenario({
  //           apiClient: this.apiClient,
  //           productId: availabilityConfig.productId,
  //           optionId: availabilityConfig.optionId,
  //           availabilityIds: ["badAvailabilityID"],
  //         }).validate();
  //       })
  //     );
  //   };

  //   private validateAvailabilityProductIdError = async (): Promise<
  //     ScenarioResult<null>[]
  //   > => {
  //     return Promise.all(
  //       this.config.getProductConfigs().map(async (availabilityConfig) => {
  //         return await new AvailabilityProductIdErrorScenario({
  //           apiClient: this.apiClient,
  //           productId: "bad productId",
  //           optionId: availabilityConfig.optionId,
  //           localDate: availabilityConfig.available.from,
  //         }).validate();
  //       })
  //     );
  //   };

  //   private validateAvailabilityOptionIdError = async (): Promise<
  //     ScenarioResult<null>[]
  //   > => {
  //     return Promise.all(
  //       this.config.getProductConfigs().map(async (availabilityConfig) => {
  //         return await new AvailabilityOptionIdErrorScenario({
  //           apiClient: this.apiClient,
  //           productId: availabilityConfig.productId,
  //           optionId: "bad optionId",
  //           localDate: availabilityConfig.available.from,
  //         }).validate();
  //       })
  //     );
  //   };

  //   private validateAvailabilityError = async (): Promise<
  //     ScenarioResult<null>[]
  //   > => {
  //     return Promise.all(
  //       this.config.getProductConfigs().map(async (availabilityConfig) => {
  //         return await new AvailabilityErrorScenario({
  //           apiClient: this.apiClient,
  //           productId: availabilityConfig.productId,
  //           optionId: availabilityConfig.optionId,
  //         }).validate();
  //       })
  //     );
  //   };
}
