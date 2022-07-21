import { Availability } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenario";
import { AvailabilityScenario } from "../../Scenarios/Availability/Availability";
import { AvailabilityErrorScenario } from "../../Scenarios/Availability/AvailabilityError";
import { AvailabilityIdErrorScenario } from "../../Scenarios/Availability/AvailabilityIdError";
import { AvailabilityNotAvailableScenario } from "../../Scenarios/Availability/AvailabilityNotAvailable";
import { AvailabilityOptionIdErrorScenario } from "../../Scenarios/Availability/AvailabilityOptionIdError";
import { AvailabilityProductIdErrorScenario } from "../../Scenarios/Availability/AvailabilityProductIdError";
import { Flow } from "../Flow";

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
    const availability = await Promise.all(await this.validateAvailability());
    const unavailable = await this.validateAvailabilityNotAvailable();
    const availabilityIdError = await this.validateAvailabilityIdError();
    const availabilityProductIdError =
      await this.validateAvailabilityProductIdError();
    const availabilityOptionIdError =
      await this.validateAvailabilityOptionIdError();
    const availabilityError = await this.validateAvailabilityError();
    const scenarios = [
      ...availability,
      ...unavailable,
      ...availabilityIdError,
      ...availabilityProductIdError,
      ...availabilityOptionIdError,
      ...availabilityError,
    ];
    return {
      name: "Availability Flow",
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      success: scenarios.every((scenario) => scenario.success),
      scenarios: scenarios,
    };
  };

  private validateAvailability = async (): Promise<
    Promise<ScenarioResult<Availability[]>>[]
  > => {
    return this.config.getProductConfigs().map((availabilityConfig) => {
      return new AvailabilityScenario({
        apiClient: this.apiClient,
        productId: availabilityConfig.productId,
        optionId: availabilityConfig.optionId,
        localDateStart: availabilityConfig.available.from,
        localDateEnd: availabilityConfig.available.to,
        capabilities: this.config.capabilities,
      }).validate();
    });
  };

  private validateAvailabilityNotAvailable = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return await new AvailabilityNotAvailableScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          localDateStart: availabilityConfig.unavailable.from,
          localDateEnd: availabilityConfig.unavailable.to,
        }).validate();
      })
    );
  };

  private validateAvailabilityIdError = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return await new AvailabilityIdErrorScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          availabilityIds: ["badAvailabilityID"],
        }).validate();
      })
    );
  };

  private validateAvailabilityProductIdError = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return await new AvailabilityProductIdErrorScenario({
          apiClient: this.apiClient,
          productId: "bad productId",
          optionId: availabilityConfig.optionId,
          localDate: availabilityConfig.available.from,
        }).validate();
      })
    );
  };

  private validateAvailabilityOptionIdError = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return await new AvailabilityOptionIdErrorScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: "bad optionId",
          localDate: availabilityConfig.available.from,
        }).validate();
      })
    );
  };

  private validateAvailabilityError = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        return await new AvailabilityErrorScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
        }).validate();
      })
    );
  };
}
