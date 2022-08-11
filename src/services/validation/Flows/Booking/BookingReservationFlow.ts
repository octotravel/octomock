import { AvailabilityType } from "@octocloud/types";
import R from "ramda";
import { BadRequestError } from "../../../../models/Error";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { BookingReservationScenario } from "../../Scenarios/Booking/Reservation/BookingReservation";
import { FlowResult } from "../Flow";

export class BookingReservationFlow {
  private config: Config;
  private apiClient: ApiClient;
  private optionIdStartTimes: Nullable<string>;
  private optionIdOpeningHours: Nullable<string>;
  constructor({ config }: { config: Config }) {
    this.config = config;
    this.apiClient = new ApiClient({
      url: config.url,
      capabilities: config.capabilities,
    });
    this.optionIdStartTimes = null;
    this.optionIdStartTimes = null;
  }

  private setOptionIds = async (): Promise<void> => {
    const productStartTimes = {
      productId: null,
      optionId: null,
    };
    const productOpeningHours = {
      productId: null,
      optionId: null,
    };
    this.config.getProductConfigs().map((availabilityConfig) => {
      if (availabilityConfig.availabilityType === AvailabilityType.START_TIME) {
        productStartTimes.productId = availabilityConfig.productId;
        productStartTimes.optionId = availabilityConfig.optionId;
      }
      if (
        availabilityConfig.availabilityType === AvailabilityType.OPENING_HOURS
      ) {
        productOpeningHours.productId = availabilityConfig.productId;
        productOpeningHours.optionId = availabilityConfig.optionId;
      }
    });
    this.optionIdStartTimes =
      productStartTimes.optionId ??
      (
        await this.apiClient.getProduct({ id: productStartTimes.productId })
      ).response.data.body.options.find((option) => option.default).id;
    this.optionIdOpeningHours =
      productOpeningHours.optionId ??
      (
        await this.apiClient.getProduct({ id: productOpeningHours.productId })
      ).response.data.body.options.find((option) => option.default).id;
  };

  private setFlow = (scenarios: ScenarioResult<any>[]): FlowResult => {
    return {
      name: "Booking Reservation",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<FlowResult> => {
    await this.setOptionIds();

    const scenarios = [...(await this.validateBooking())];

    // const bookingProductIdError = await this.validateBookingProductIdError();
    // const bookingOptionIdError = await this.validateBookingOptionIdError();
    // const bookingAvailabilityIdError =
    //   await this.validateBookingAvailabilityIdError();
    // const bookingEntityError = await this.validateBookingEntityError();
    // const bookingUnitIdError = await this.validateBookingUnitIdError();

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

  private validateBooking = async (): Promise<BookingReservationScenario[]> => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        const availability = await this.apiClient.getAvailability({
          productId: availabilityConfig.productId,
          optionId:
            availabilityConfig.availabilityType ===
            AvailabilityType.OPENING_HOURS
              ? this.optionIdOpeningHours
              : this.optionIdStartTimes,
          localDateStart: availabilityConfig.available.from,
          localDateEnd: availabilityConfig.available.to,
        });
        if (
          R.isEmpty(availability.response.data.body) &&
          !availability.response.error
        ) {
          throw new BadRequestError("Invalid available dates!");
        }
        const product = await this.apiClient.getProduct({
          id: availabilityConfig.productId,
        });
        console.log(availability.response.data.body[0].id);
        return new BookingReservationScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId:
            availabilityConfig.availabilityType ===
            AvailabilityType.OPENING_HOURS
              ? this.optionIdOpeningHours
              : this.optionIdStartTimes,
          availabilityId: availability.response.data.body[0].id,
          availabilityType: availabilityConfig.availabilityType,
          unitItems: [
            {
              unitId: product.response.data.body.options[0].units[0].id,
            },
            {
              unitId: product.response.data.body.options[0].units[0].id,
            },
          ],
          capabilities: this.config.capabilities,
        });
      })
    );
  };

  //   private validateBookingProductIdError = async (): Promise<
  //     ScenarioResult<null>[]
  //   > => {
  //     return Promise.all(
  //       this.config.getProductConfigs().map(async (availabilityConfig) => {
  //         const availability = await this.apiClient.getAvailability({
  //           productId: availabilityConfig.productId,
  //           optionId: availabilityConfig.optionId,
  //           localDateStart: availabilityConfig.available.from,
  //           localDateEnd: availabilityConfig.available.to,
  //         });
  //         if (R.isEmpty(availability.result) && !availability.error) {
  //           throw new BadRequestError("Invalid available dates!");
  //         }
  //         const product = await this.apiClient.getProduct({
  //           id: availabilityConfig.productId,
  //         });
  //         return new BookingReservationProductIdErrorScenario({
  //           apiClient: this.apiClient,
  //           productId: "bad product Id",
  //           optionId: availabilityConfig.optionId,
  //           availabilityId: availability.result[0].id,
  //           unitItems: [
  //             {
  //               unitId: product.result.options[0].units[0].id,
  //             },
  //             {
  //               unitId: product.result.options[0].units[0].id,
  //             },
  //           ],
  //           capabilities: this.config.capabilities,
  //         }).validate();
  //       })
  //     );
  //   };

  //   private validateBookingOptionIdError = async (): Promise<
  //     ScenarioResult<null>[]
  //   > => {
  //     return Promise.all(
  //       this.config.getProductConfigs().map(async (availabilityConfig) => {
  //         const availability = await this.apiClient.getAvailability({
  //           productId: availabilityConfig.productId,
  //           optionId: availabilityConfig.optionId,
  //           localDateStart: availabilityConfig.available.from,
  //           localDateEnd: availabilityConfig.available.to,
  //         });
  //         if (R.isEmpty(availability.result) && !availability.error) {
  //           throw new BadRequestError("Invalid available dates!");
  //         }
  //         const product = await this.apiClient.getProduct({
  //           id: availabilityConfig.productId,
  //         });
  //         return new BookingReservationOptionIdErrorScenario({
  //           apiClient: this.apiClient,
  //           productId: availabilityConfig.productId,
  //           optionId: "bad optionId",
  //           availabilityId: availability.result[0].id,
  //           unitItems: [
  //             {
  //               unitId: product.result.options[0].units[0].id,
  //             },
  //             {
  //               unitId: product.result.options[0].units[0].id,
  //             },
  //           ],
  //           capabilities: this.config.capabilities,
  //         }).validate();
  //       })
  //     );
  //   };

  //   private validateBookingAvailabilityIdError = async (): Promise<
  //     ScenarioResult<null>[]
  //   > => {
  //     return Promise.all(
  //       this.config.getProductConfigs().map(async (availabilityConfig) => {
  //         const product = await this.apiClient.getProduct({
  //           id: availabilityConfig.productId,
  //         });
  //         return new BookingReservationAvailabilityIdErrorScenario({
  //           apiClient: this.apiClient,
  //           productId: availabilityConfig.productId,
  //           optionId: availabilityConfig.optionId,
  //           availabilityId: "bad availability id",
  //           unitItems: [
  //             {
  //               unitId: product.result.options[0].units[0].id,
  //             },
  //             {
  //               unitId: product.result.options[0].units[0].id,
  //             },
  //           ],
  //           capabilities: this.config.capabilities,
  //         }).validate();
  //       })
  //     );
  //   };

  //   private validateBookingEntityError = async (): Promise<
  //     ScenarioResult<null>[]
  //   > => {
  //     return Promise.all(
  //       this.config.getProductConfigs().map(async (availabilityConfig) => {
  //         const availability = await this.apiClient.getAvailability({
  //           productId: availabilityConfig.productId,
  //           optionId: availabilityConfig.optionId,
  //           localDateStart: availabilityConfig.available.from,
  //           localDateEnd: availabilityConfig.available.to,
  //         });
  //         if (R.isEmpty(availability.result) && !availability.error) {
  //           throw new BadRequestError("Invalid available dates!");
  //         }
  //         return new BookingReservationEntityErrorScenario({
  //           apiClient: this.apiClient,
  //           productId: availabilityConfig.productId,
  //           optionId: availabilityConfig.optionId,
  //           availabilityId: availability.result[0].id,
  //           unitItems: [],
  //           capabilities: this.config.capabilities,
  //         }).validate();
  //       })
  //     );
  //   };

  //   private validateBookingUnitIdError = async (): Promise<
  //     ScenarioResult<null>[]
  //   > => {
  //     return Promise.all(
  //       this.config.getProductConfigs().map(async (availabilityConfig) => {
  //         const availability = await this.apiClient.getAvailability({
  //           productId: availabilityConfig.productId,
  //           optionId: availabilityConfig.optionId,
  //           localDateStart: availabilityConfig.available.from,
  //           localDateEnd: availabilityConfig.available.to,
  //         });
  //         if (R.isEmpty(availability.result) && !availability.error) {
  //           throw new BadRequestError("Invalid available dates!");
  //         }
  //         return new BookingReservationUnitIdErrorScenario({
  //           apiClient: this.apiClient,
  //           productId: availabilityConfig.productId,
  //           optionId: availabilityConfig.optionId,
  //           availabilityId: availability.result[0].id,
  //           unitItems: [
  //             {
  //               unitId: "bad unitId",
  //             },
  //             {
  //               unitId: "bad unitId",
  //             },
  //           ],
  //           capabilities: this.config.capabilities,
  //         }).validate();
  //       })
  //     );
  //   };
}
