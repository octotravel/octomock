// import { eachDayOfInterval } from "date-fns";
import { Config } from "../../config/Config";
import { AvailabilityCheckIntervalScenario } from "../../Scenarios/Availability/AvailabilityCheckInterval";
import { BaseFlow } from "../BaseFlow";
// import { AvailabilityCheckDateScenario } from "../../Scenarios/Availability/AvailabilityCheckDate";
import { Flow, FlowResult } from "../Flow";
// import { DateHelper } from "../../../../helpers/DateHelper";
// import { AvailabilityCheckUnavailableDatesScenario } from "../../Scenarios/Availability/AvailabilityCheckUnavailableDates";
// import { AvailabilityCheckInvalidProductScenario } from "../../Scenarios/Availability/AvailabilityCheckInvalidProduct";
// import { AvailabilityCheckInvalidOptionScenario } from "../../Scenarios/Availability/AvailabilityCheckInvalidOption";
// import { AvailabilityCheckBadRequestScenario } from "../../Scenarios/Availability/AvailabilityCheckBadRequest";
// import { AvailabilityCheckAvailabilityIdScenario } from "../../Scenarios/Availability/AvailabilityCheckAvailabilityId";
// import { BadRequestError } from "../../../../models/Error";
// import * as R from "ramda";

export class AvailabilityFlow extends BaseFlow implements Flow {
  public config = Config.getInstance();
  constructor() {
    super("Availability Check");
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios = [
      new AvailabilityCheckIntervalScenario(),
      //   ...this.validateAvailabilityCheckInterval(),
      //   ...this.validateAvailabilityCheckDate(),
      //   ...(await this.validateAvailabilityCheckAvailabilityId()),
      //   ...this.validateAvailabilityCheckUnavailableDates(),
      //   ...this.validateAvailabilityCheckInvalidProduct(),
      //   ...this.validateAvailabilityCheckInvalidOption(),
      //   ...this.validateAvailabilityCheckBadRequest(),
    ];

    const results = [];
    for await (const scenario of scenarios) {
      const result = await scenario.validate();
      results.push(result);
      if (!result.success && !this.config.ignoreKill) {
        break;
      }
    }
    return this.getFlowResult(results);
  };

  //   private validateAvailabilityCheckInterval =
  //     (): AvailabilityCheckIntervalScenario[] => {
  //       return this.config.getProductConfigs().map((availabilityConfig) => {
  //         return new AvailabilityCheckIntervalScenario({
  //           apiClient: this.apiClient,
  //           productId: availabilityConfig.productId,
  //           optionId:
  //             availabilityConfig.availabilityType ===
  //             AvailabilityType.OPENING_HOURS
  //               ? this.optionIdOpeningHours
  //               : this.optionIdStartTimes,
  //           localDateStart: availabilityConfig.available.from,
  //           localDateEnd: availabilityConfig.available.to,
  //           availabilityType: availabilityConfig.availabilityType,
  //           capabilities: this.config.capabilities,
  //         });
  //       });
  //     };

  //   private validateAvailabilityCheckDate =
  //     (): AvailabilityCheckDateScenario[] => {
  //       return this.config.getProductConfigs().map((availabilityConfig) => {
  //         const dates = eachDayOfInterval({
  //           start: new Date(availabilityConfig.available.from),
  //           end: new Date(availabilityConfig.available.to),
  //         }).map((date) => {
  //           return DateHelper.availabilityDateFormat(date);
  //         });
  //         return new AvailabilityCheckDateScenario({
  //           apiClient: this.apiClient,
  //           productId: availabilityConfig.productId,
  //           optionId:
  //             availabilityConfig.availabilityType ===
  //             AvailabilityType.OPENING_HOURS
  //               ? this.optionIdOpeningHours
  //               : this.optionIdStartTimes,
  //           localDate: dates[Math.floor(Math.random() * dates.length)],
  //           availabilityType: availabilityConfig.availabilityType,
  //           capabilities: this.config.capabilities,
  //         });
  //       });
  //     };

  // private validateAvailabilityCheckAvailabilityId = async (): Promise<
  //   AvailabilityCheckAvailabilityIdScenario[]
  // > => {
  //   return Promise.all(
  //     this.config.getProductConfigs().map(async (availabilityConfig) => {
  //       const dates = eachDayOfInterval({
  //         start: new Date(availabilityConfig.available.from),
  //         end: new Date(availabilityConfig.available.to),
  //       }).map((date) => {
  //         return DateHelper.availabilityDateFormat(date);
  //       });
  //       const availability = (
  //         await this.apiClient.getAvailability({
  //           productId: availabilityConfig.productId,
  //           optionId:
  //             availabilityConfig.availabilityType ===
  //             AvailabilityType.OPENING_HOURS
  //               ? this.optionIdOpeningHours
  //               : this.optionIdStartTimes,
  //           localDate: dates[Math.floor(Math.random() * dates.length)],
  //         })
  //       ).response.data.body;
  //       if (R.isEmpty(availability)) {
  //         throw new BadRequestError("Invalid available dates!");
  //       }
  //       return new AvailabilityCheckAvailabilityIdScenario({
  //         apiClient: this.apiClient,
  //         productId: availabilityConfig.productId,
  //         optionId:
  //           availabilityConfig.availabilityType ===
  //           AvailabilityType.OPENING_HOURS
  //             ? this.optionIdOpeningHours
  //             : this.optionIdStartTimes,
  //         availabilityType: availabilityConfig.availabilityType,
  //         availabilityIds: [availability[0].id],
  //         capabilities: this.config.capabilities,
  //       });
  //     })
  //   );
  // };

  //   private validateAvailabilityCheckUnavailableDates =
  //     (): AvailabilityCheckUnavailableDatesScenario[] => {
  //       return this.config.getProductConfigs().map((availabilityConfig) => {
  //         return new AvailabilityCheckUnavailableDatesScenario({
  //           apiClient: this.apiClient,
  //           productId: availabilityConfig.productId,
  //           optionId:
  //             availabilityConfig.availabilityType ===
  //             AvailabilityType.OPENING_HOURS
  //               ? this.optionIdOpeningHours
  //               : this.optionIdStartTimes,
  //           localDateStart: availabilityConfig.unavailable.from,
  //           localDateEnd: availabilityConfig.unavailable.to,
  //           availabilityType: availabilityConfig.availabilityType,
  //           capabilities: this.config.capabilities,
  //         });
  //       });
  //     };

  //   private validateAvailabilityCheckInvalidProduct =
  //     (): AvailabilityCheckInvalidProductScenario[] => {
  //       return this.config.getProductConfigs().map((availabilityConfig) => {
  //         return new AvailabilityCheckInvalidProductScenario({
  //           apiClient: this.apiClient,
  //           productId: "invalid_productid",
  //           optionId:
  //             availabilityConfig.availabilityType ===
  //             AvailabilityType.OPENING_HOURS
  //               ? this.optionIdOpeningHours
  //               : this.optionIdStartTimes,
  //           localDate: availabilityConfig.available.from,
  //         });
  //       });
  //     };

  //   private validateAvailabilityCheckInvalidOption =
  //     (): AvailabilityCheckInvalidOptionScenario[] => {
  //       return this.config.getProductConfigs().map((availabilityConfig) => {
  //         return new AvailabilityCheckInvalidOptionScenario({
  //           apiClient: this.apiClient,
  //           productId: availabilityConfig.productId,
  //           optionId: "invalid_optionid",
  //           localDate: availabilityConfig.available.from,
  //         });
  //       });
  //     };

  //   private validateAvailabilityCheckBadRequest =
  //     (): AvailabilityCheckBadRequestScenario[] => {
  //       const response = this.config
  //         .getProductConfigs()
  //         .map((availabilityConfig) => {
  //           const emptyBody = new AvailabilityCheckBadRequestScenario({
  //             apiClient: this.apiClient,
  //             productId: availabilityConfig.productId,
  //             optionId:
  //               availabilityConfig.availabilityType ===
  //               AvailabilityType.OPENING_HOURS
  //                 ? this.optionIdOpeningHours
  //                 : this.optionIdStartTimes,
  //           });

  //           const allDatesBody = new AvailabilityCheckBadRequestScenario({
  //             apiClient: this.apiClient,
  //             productId: availabilityConfig.productId,
  //             optionId:
  //               availabilityConfig.availabilityType ===
  //               AvailabilityType.OPENING_HOURS
  //                 ? this.optionIdOpeningHours
  //                 : this.optionIdStartTimes,
  //             localDate: availabilityConfig.available.from,
  //             localDateStart: availabilityConfig.available.to,
  //             localDateEnd: availabilityConfig.available.from,
  //           });

  //           const localDateAvailabilityIdsBody =
  //             new AvailabilityCheckBadRequestScenario({
  //               apiClient: this.apiClient,
  //               productId: availabilityConfig.productId,
  //               optionId:
  //                 availabilityConfig.availabilityType ===
  //                 AvailabilityType.OPENING_HOURS
  //                   ? this.optionIdOpeningHours
  //                   : this.optionIdStartTimes,
  //               localDate: availabilityConfig.available.from,
  //               availabilityIds: ["random_availability_id"],
  //             });

  //           const datesAvailabilityIdsBody =
  //             new AvailabilityCheckBadRequestScenario({
  //               apiClient: this.apiClient,
  //               productId: availabilityConfig.productId,
  //               optionId:
  //                 availabilityConfig.availabilityType ===
  //                 AvailabilityType.OPENING_HOURS
  //                   ? this.optionIdOpeningHours
  //                   : this.optionIdStartTimes,
  //               localDateStart: availabilityConfig.available.from,
  //               localDateEnd: availabilityConfig.available.to,
  //               availabilityIds: ["random_availability_id"],
  //             });

  //           return [
  //             emptyBody,
  //             allDatesBody,
  //             localDateAvailabilityIdsBody,
  //             datesAvailabilityIdsBody,
  //           ];
  //         });
  //       return response.flat(1);
  //     };
}
