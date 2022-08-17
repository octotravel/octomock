import { AvailabilityType } from "@octocloud/types";
import R from "ramda";
import { BadRequestError } from "../../../../models/Error";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { FlowResult } from "../Flow";
import { BookingCancellationScenario } from "../../Scenarios/Booking/Cancellation/BookingCancellation";

export class BookingCancellationFlow {
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
    this.optionIdOpeningHours = null;
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
    if (productStartTimes.productId) {
      this.optionIdStartTimes = productStartTimes.productId
        ? (
            await this.apiClient.getProduct({ id: productStartTimes.productId })
          ).response.data.body.options.find((option) => option.default).id
        : null;
    } else {
      this.optionIdStartTimes = null;
    }
    if (productOpeningHours.productId) {
      this.optionIdOpeningHours = productOpeningHours.productId
        ? (
            await this.apiClient.getProduct({
              id: productOpeningHours.productId,
            })
          ).response.data.body.options.find((option) => option.default).id
        : null;
    } else {
      this.optionIdOpeningHours = null;
    }
  };

  private setFlow = (scenarios: ScenarioResult<any>[]): FlowResult => {
    return {
      name: "Booking Cancellation",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<FlowResult> => {
    await this.setOptionIds();

    const scenarios = [...(await this.validateBookingCancellation())];

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

  private validateBookingCancellation = async (): Promise<
    BookingCancellationScenario[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        const availability = (
          await this.apiClient.getAvailability({
            productId: availabilityConfig.productId,
            optionId:
              availabilityConfig.availabilityType ===
              AvailabilityType.OPENING_HOURS
                ? this.optionIdOpeningHours
                : this.optionIdStartTimes,
            localDateStart: availabilityConfig.available.from,
            localDateEnd: availabilityConfig.available.to,
          })
        ).response;
        if (R.isEmpty(availability.data) && !availability.error) {
          throw new BadRequestError("Invalid available dates!");
        }
        const product = (
          await this.apiClient.getProduct({
            id: availabilityConfig.productId,
          })
        ).response.data.body;
        const booking = (
          await this.apiClient.bookingReservation({
            productId: availabilityConfig.productId,
            optionId:
              availabilityConfig.availabilityType ===
              AvailabilityType.OPENING_HOURS
                ? this.optionIdOpeningHours
                : this.optionIdStartTimes,
            availabilityId: availability.data.body[0].id,
            unitItems: [
              {
                unitId: product.options[0].units[0].id,
              },
              {
                unitId: product.options[0].units[0].id,
              },
            ],
          })
        ).response.data.body;
        return new BookingCancellationScenario({
          apiClient: this.apiClient,
          uuid: booking.uuid,
          capabilities: this.config.capabilities,
          deliveryMethods: availabilityConfig.deliveryMethods,
          booking,
        });
      })
    );
  };

  //   private validateBookingConfirmationUnitItemsUpdate = async (): Promise<
  //   BookingConfirmationUnitItemUpdateScenario[]
  // > => {
  //   return Promise.all(
  //     this.config.getProductConfigs().map(async (availabilityConfig) => {
  //       const availability = (
  //         await this.apiClient.getAvailability({
  //           productId: availabilityConfig.productId,
  //           optionId:
  //             availabilityConfig.availabilityType ===
  //             AvailabilityType.OPENING_HOURS
  //               ? this.optionIdOpeningHours
  //               : this.optionIdStartTimes,
  //           localDateStart: availabilityConfig.available.from,
  //           localDateEnd: availabilityConfig.available.to,
  //         })
  //       ).response;
  //       if (R.isEmpty(availability.data) && !availability.error) {
  //         throw new BadRequestError("Invalid available dates!");
  //       }
  //       const product = (
  //         await this.apiClient.getProduct({
  //           id: availabilityConfig.productId,
  //         })
  //       ).response.data.body;
  //       const booking = (
  //         await this.apiClient.bookingReservation({
  //           productId: availabilityConfig.productId,
  //           optionId:
  //             availabilityConfig.availabilityType ===
  //             AvailabilityType.OPENING_HOURS
  //               ? this.optionIdOpeningHours
  //               : this.optionIdStartTimes,
  //           availabilityId: availability.data.body[0].id,
  //           unitItems: [
  //             {
  //               unitId: product.options[0].units[0].id,
  //             },
  //             {
  //               unitId: product.options[0].units[0].id,
  //             },
  //           ],
  //         })
  //       ).response.data.body;
  //       return new BookingConfirmationUnitItemUpdateScenario({
  //         apiClient: this.apiClient,
  //         uuid: booking.uuid,
  //         capabilities: this.config.capabilities,
  //         availabilityType: availabilityConfig.availabilityType,
  //         deliveryMethods: availabilityConfig.deliveryMethods,
  //         unitItems: [
  //           {
  //             unitId: product.options[0].units[0].id,
  //           },
  //           {
  //             unitId: product.options[0].units[0].id,
  //           },
  //           {
  //             unitId: product.options[0].units[0].id,
  //           },
  //           {
  //             unitId: product.options[0].units[0].id,
  //           },
  //         ],
  //         booking,
  //       });
  //     }))
  //   };

  //   private validateBookingInvalidUUIDError = async (): Promise<BookingConfirmationInvalidUUIDScenario
  //   > => {
  //     return new BookingConfirmationInvalidUUIDScenario({
  //       apiClient: this.apiClient,
  //       uuid: "Invalid UUID",
  //       contact: {},
  //       capabilities: this.config.capabilities,
  //     });
  //   };
}
