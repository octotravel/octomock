import { AvailabilityType } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { FlowResult } from "../Flow";
import { AvailabilityCalendarIntervalScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarInterval";
// import { AvailabilityCalendarUnavailableDatesScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarUnavailableDates";
// import { AvailabilityCalendarInvalidProductScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarInvalidProduct";
// import { AvailabilityCalendarInvalidOptionScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarInvalidOption";
// import { AvailabilityCalendarBadRequestScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarBadRequest";
import { DateHelper } from "../../../../helpers/DateHelper";
import { addDays } from "date-fns";

export class AvailabilityCalendarFlow {
  private config: Config;
  private apiClient: ApiClient;
  constructor({ config }: { config: Config }) {
    this.config = config;
    this.apiClient = new ApiClient({
      url: config.url,
      capabilities: config.capabilities,
      apiKey: this.config.apiKey,
    });
  }

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
    const scenarios = [
      await this.validateAvailabilityCalendarInterval(),
      //   ...(await this.validateAvailabilityCalendarUnavailableDates()),
      //   ...(await this.validateAvailabilityCalendarInvalidProduct()),
      //   ...(await this.validateAvailabilityCalendarInvalidOption()),
      //   ...(await this.validateAvailabilityCheckBadRequest()),
    ];

    const results = [];
    for await (const scenario of scenarios) {
      const result = await scenario.validate();
      results.push(result);
      if (!result.success && !this.config.ignoreKill) {
        break;
      }
    }
    return this.setFlow(results);
  };

  private validateAvailabilityCalendarInterval =
    async (): Promise<AvailabilityCalendarIntervalScenario> => {
      return new AvailabilityCalendarIntervalScenario({
        apiClient: this.apiClient,
        productId:
          this.config.startTimesProducts.availabilityAvailable.productId,
        optionId: this.config.startTimesProducts.availabilityAvailable.optionId,
        localDateStart: DateHelper.getDate(new Date().toISOString()),
        localDateEnd: DateHelper.getDate(addDays(new Date(), 30).toISOString()),
        availabilityType: AvailabilityType.START_TIME,
        capabilities: this.config.capabilities,
      });
    };

  //   private validateAvailabilityCalendarUnavailableDates = async (): Promise<
  //     AvailabilityCalendarUnavailableDatesScenario[]
  //   > => {
  //     return this.config.getProductConfigs().map((availabilityConfig) => {
  //       return new AvailabilityCalendarUnavailableDatesScenario({
  //         apiClient: this.apiClient,
  //         productId: availabilityConfig.productId,
  //         optionId:
  //           availabilityConfig.availabilityType === AvailabilityType.OPENING_HOURS
  //             ? this.optionIdOpeningHours
  //             : this.optionIdStartTimes,
  //         localDateStart: availabilityConfig.unavailable.from,
  //         localDateEnd: availabilityConfig.unavailable.to,
  //         availabilityType: availabilityConfig.availabilityType,
  //         capabilities: this.config.capabilities,
  //       });
  //     });
  //   };

  //   private validateAvailabilityCalendarInvalidProduct = async (): Promise<
  //     AvailabilityCalendarInvalidProductScenario[]
  //   > => {
  //     return Promise.all(
  //       this.config.getProductConfigs().map(async (availabilityConfig) => {
  //         return new AvailabilityCalendarInvalidProductScenario({
  //           apiClient: this.apiClient,
  //           productId: "invalid_productid",
  //           optionId:
  //             availabilityConfig.availabilityType ===
  //             AvailabilityType.OPENING_HOURS
  //               ? this.optionIdOpeningHours
  //               : this.optionIdStartTimes,
  //           localDateStart: availabilityConfig.available.from,
  //           localDateEnd: availabilityConfig.available.to,
  //         });
  //       })
  //     );
  //   };

  //   private validateAvailabilityCalendarInvalidOption = async (): Promise<
  //     AvailabilityCalendarInvalidOptionScenario[]
  //   > => {
  //     return Promise.all(
  //       this.config.getProductConfigs().map(async (availabilityConfig) => {
  //         return new AvailabilityCalendarInvalidOptionScenario({
  //           apiClient: this.apiClient,
  //           productId: availabilityConfig.productId,
  //           optionId: "invalid_optionid",
  //           localDateStart: availabilityConfig.available.from,
  //           localDateEnd: availabilityConfig.available.to,
  //         });
  //       })
  //     );
  //   };

  //   private validateAvailabilityCheckBadRequest = async (): Promise<
  //     AvailabilityCalendarBadRequestScenario[]
  //   > => {
  //     const response = this.config
  //       .getProductConfigs()
  //       .map(async (availabilityConfig) => {
  //         const localDateStartBody = new AvailabilityCalendarBadRequestScenario({
  //           apiClient: this.apiClient,
  //           productId: availabilityConfig.productId,
  //           optionId:
  //             availabilityConfig.availabilityType ===
  //             AvailabilityType.OPENING_HOURS
  //               ? this.optionIdOpeningHours
  //               : this.optionIdStartTimes,
  //           localDateStart: availabilityConfig.available.to,
  //         });

  //         const localDateEndBody = new AvailabilityCalendarBadRequestScenario({
  //           apiClient: this.apiClient,
  //           productId: availabilityConfig.productId,
  //           optionId:
  //             availabilityConfig.availabilityType ===
  //             AvailabilityType.OPENING_HOURS
  //               ? this.optionIdOpeningHours
  //               : this.optionIdStartTimes,
  //           localDateEnd: availabilityConfig.available.from,
  //         });

  //         return [localDateStartBody, localDateEndBody];
  //       });
  //     return (await Promise.all(response)).flat(1);
  //   };
}
