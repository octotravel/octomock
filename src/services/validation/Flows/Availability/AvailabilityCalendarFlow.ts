import { AvailabilityCalendar } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenario";
import { AvailabilityCalendarScenario } from "../../Scenarios/AvailabilityCalendar/Availability";
import { Flow } from "../Flow";

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
    const availability = await Promise.all(await this.validateAvailability());
    const scenarios = [...availability];
    return {
      name: "Availability Calendar Flow",
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      success: scenarios.every((scenario) => scenario.success),
      scenarios: scenarios,
    };
  };

  private validateAvailability = async (): Promise<
    Promise<ScenarioResult<AvailabilityCalendar[]>>[]
  > => {
    return this.config.getProductConfigs().map((availabilityConfig) => {
      return new AvailabilityCalendarScenario({
        apiClient: this.apiClient,
        productId: availabilityConfig.productId,
        optionId: availabilityConfig.optionId,
        localDateStart: availabilityConfig.available.from,
        localDateEnd: availabilityConfig.available.to,
        capabilities: this.config.capabilities,
      }).validate();
    });
  };
}
