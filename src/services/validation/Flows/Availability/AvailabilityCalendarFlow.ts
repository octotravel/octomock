import { AvailabilityType } from "@octocloud/types";
import { ApiClient } from "../../api/ApiClient";
import { Config } from "../../config/Config";
import { Scenario, ScenarioResult } from "../../Scenarios/Scenario";
import { Flow, FlowResult } from "../Flow";
import { AvailabilityCalendarIntervalScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarInterval";
// import { AvailabilityCalendarUnavailableDatesScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarUnavailableDates";
// import { AvailabilityCalendarInvalidProductScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarInvalidProduct";
// import { AvailabilityCalendarInvalidOptionScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarInvalidOption";
// import { AvailabilityCalendarBadRequestScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarBadRequest";
import { DateHelper } from "../../../../helpers/DateHelper";
import { addDays } from "date-fns";
import { BaseFlow } from "../BaseFlow";

export class AvailabilityCalendarFlow extends BaseFlow implements Flow {
  private config = Config.getInstance();
  private apiClient: ApiClient;
  constructor() {
    super("Availability Calendar");
    this.apiClient = new ApiClient({
      url: this.config.getEndpointData().endpoint,
      apiKey: this.config.getEndpointData().apiKey,
      capabilities: this.config.getCapabilityIDs(),
    });
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios: Scenario<unknown>[] = [
      await this.validateAvailabilityCalendarInterval(),
      //   ...(await this.validateAvailabilityCalendarUnavailableDates()),
      //   ...(await this.validateAvailabilityCalendarInvalidProduct()),
      //   ...(await this.validateAvailabilityCalendarInvalidOption()),
      //   ...(await this.validateAvailabilityCheckBadRequest()),
    ];

    const results: ScenarioResult<unknown>[] = [];
    for await (const scenario of scenarios) {
      const result = await scenario.validate();
      results.push(result);
      if (!result.success && !this.config.ignoreKill) {
        break;
      }
    }
    return this.getFlowResult(results);
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
        capabilities: this.config.getCapabilityIDs(),
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
