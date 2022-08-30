import { AvailabilityType } from "@octocloud/types";
import * as R from "ramda";
import { BadRequestError } from "../../../../models/Error";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { BookingValidateData, ScenarioResult } from "../../Scenarios/Scenario";
import { FlowResult } from "../Flow";
import { BookingGetReservationScenario } from "../../Scenarios/Booking/Get/BookingGetReservation";
import { BookingGetBookingScenario } from "../../Scenarios/Booking/Get/BookingGetBooking";
import { BookingGetInvalidUUIDScenario } from "../../Scenarios/Booking/Get/BookingGetInvalidUUID";

export class BookingGetFlow {
  private config: Config;
  private apiClient: ApiClient;
  private startTimes: Nullable<BookingValidateData>;
  private openingHours: Nullable<BookingValidateData>;
  constructor({ config }: { config: Config }) {
    this.config = config;
    this.apiClient = new ApiClient({
      url: config.url,
      capabilities: config.capabilities,
      apiKey: this.config.apiKey,
    });
  }

  private fetchData = async (): Promise<void> => {
    await Promise.all(
      this.config.getProductConfigs().map(async (productConfig) => {
        const optionId =
          productConfig.optionId ??
          (
            await this.apiClient.getProduct({ id: productConfig.productId })
          ).response.data.body.options.find((option) => option.default).id;
        const availability = await this.apiClient.getAvailability({
          productId: productConfig.productId,
          optionId: optionId,
          localDateStart: productConfig.available.from,
          localDateEnd: productConfig.available.to,
        });
        if (
          R.isEmpty(availability.response.data.body) &&
          !availability.response.error
        ) {
          throw new BadRequestError("Invalid available dates!");
        }
        const product = (
          await this.apiClient.getProduct({
            id: productConfig.productId,
          })
        ).response.data.body;

        if (productConfig.availabilityType === AvailabilityType.START_TIME) {
          this.startTimes = {
            productId: productConfig.productId,
            optionId,
            availability: availability.response.data.body,
            product,
          };
        } else {
          this.openingHours = {
            productId: productConfig.productId,
            optionId,
            availability: availability.response.data.body,
            product,
          };
        }
      })
    );
  };

  private setFlow = (scenarios: ScenarioResult<any>[]): FlowResult => {
    return {
      name: "Get Booking",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<FlowResult> => {
    await this.fetchData();

    const scenarios = [
      ...(await this.validateGetBookingReservation()),
      ...(await this.validateGetBookingBooking()),
      await this.validateGetBookingInvalidUUIDError(),
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

  private validateGetBookingReservation = async (): Promise<
    BookingGetReservationScenario[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (productConfig) => {
        const validateData =
          productConfig.availabilityType === AvailabilityType.OPENING_HOURS
            ? this.openingHours
            : this.startTimes;
        const booking = (
          await this.apiClient.bookingReservation({
            productId: validateData.productId,
            optionId: validateData.optionId,
            availabilityId: validateData.availability[0].id,
            unitItems: [
              {
                unitId: validateData.product.options.find(
                  (option) => option.id === validateData.optionId
                ).units[0].id,
              },
              {
                unitId: validateData.product.options.find(
                  (option) => option.id === validateData.optionId
                ).units[0].id,
              },
            ],
          })
        ).response.data.body;
        return new BookingGetReservationScenario({
          apiClient: this.apiClient,
          uuid: booking.uuid,
          capabilities: this.config.capabilities,
        });
      })
    );
  };

  private validateGetBookingBooking = async (): Promise<
    BookingGetBookingScenario[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (productConfig) => {
        const validateData =
          productConfig.availabilityType === AvailabilityType.OPENING_HOURS
            ? this.openingHours
            : this.startTimes;
        const booking = (
          await this.apiClient.bookingReservation({
            productId: validateData.productId,
            optionId: validateData.optionId,
            availabilityId: validateData.availability[0].id,
            unitItems: [
              {
                unitId: validateData.product.options.find(
                  (option) => option.id === validateData.optionId
                ).units[0].id,
              },
              {
                unitId: validateData.product.options.find(
                  (option) => option.id === validateData.optionId
                ).units[0].id,
              },
            ],
          })
        ).response.data.body;
        const confirmedBooking = (
          await this.apiClient.bookingConfirmation({
            uuid: booking.uuid,
            contact: {
              fullName: "John Doe",
            },
          })
        ).response.data.body;
        return new BookingGetBookingScenario({
          apiClient: this.apiClient,
          uuid: confirmedBooking.uuid,
          capabilities: this.config.capabilities,
        });
      })
    );
  };

  private validateGetBookingInvalidUUIDError =
    async (): Promise<BookingGetInvalidUUIDScenario> => {
      return new BookingGetInvalidUUIDScenario({
        apiClient: this.apiClient,
        uuid: "invalid_UUID",
        capabilities: this.config.capabilities,
      });
    };
}
