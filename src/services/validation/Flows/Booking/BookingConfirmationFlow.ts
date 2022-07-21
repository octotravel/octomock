import { Booking } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenario";
import { BookingConfirmationScenario } from "../../Scenarios/Booking/Confirmation/BookingConfirmation";
import { BookingConfirmationEntityErrorScenario } from "../../Scenarios/Booking/Confirmation/BookingConfirmationEntityError";
import { BookingConfirmationUnitIdErrorScenario } from "../../Scenarios/Booking/Confirmation/BookingConfirmationUnitIdError";
import { BookingConfirmationUuidErrorScenario } from "../../Scenarios/Booking/Confirmation/BookingConfirmationUuidError";
import { Flow } from "../Flow";

export class BookingConfirmationFlow {
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
    const booking = await this.validateBooking();
    const bookingUuidError = await this.validateBookingUuidError();
    const bookingUnitIdError = await this.validateBookingUnitIdError();
    const bookingEntityError = await this.validateBookingEntityError();
    const scenarios = [
      ...booking,
      bookingUuidError,
      ...bookingUnitIdError,
      ...bookingEntityError,
    ];
    return {
      name: "Booking Confirmation Flow",
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      success: scenarios.every((scenario) => scenario.success),
      scenarios: scenarios,
    };
  };

  private validateBooking = async (): Promise<ScenarioResult<Booking>[]> => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        const availability = await this.apiClient.getAvailability({
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          localDateStart: availabilityConfig.available.from,
          localDateEnd: availabilityConfig.available.to,
        });
        const product = await this.apiClient.getProduct({
          id: availabilityConfig.productId,
        });
        const booking = await this.apiClient.bookingReservation({
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          availabilityId: availability.result[0].id,
          unitItems: [
            {
              unitId: product.result.options[0].units[0].id,
            },
            {
              unitId: product.result.options[0].units[0].id,
            },
          ],
        });
        return new BookingConfirmationScenario({
          apiClient: this.apiClient,
          uuid: booking.result.uuid,
          capabilities: this.config.capabilities,
        }).validate();
      })
    );
  };

  private validateBookingUuidError = async (): Promise<
    ScenarioResult<null>
  > => {
    return new BookingConfirmationUuidErrorScenario({
      apiClient: this.apiClient,
      uuid: "bad uuid",
      contact: {},
      capabilities: this.config.capabilities,
    }).validate();
  };

  private validateBookingUnitIdError = async () => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        const availability = await this.apiClient.getAvailability({
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          localDateStart: availabilityConfig.available.from,
          localDateEnd: availabilityConfig.available.to,
        });
        const product = await this.apiClient.getProduct({
          id: availabilityConfig.productId,
        });
        const booking = await this.apiClient.bookingReservation({
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          availabilityId: availability.result[0].id,
          unitItems: [
            {
              unitId: product.result.options[0].units[0].id,
            },
            {
              unitId: product.result.options[0].units[0].id,
            },
          ],
        });
        return new BookingConfirmationUnitIdErrorScenario({
          apiClient: this.apiClient,
          uuid: booking.result.uuid,
          unitItems: [
            {
              unitId: "bad id",
            },
            {
              unitId: "bad id",
            },
          ],
          contact: {},
          capabilities: this.config.capabilities,
        }).validate();
      })
    );
  };

  private validateBookingEntityError = async () => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        const availability = await this.apiClient.getAvailability({
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          localDateStart: availabilityConfig.available.from,
          localDateEnd: availabilityConfig.available.to,
        });
        const product = await this.apiClient.getProduct({
          id: availabilityConfig.productId,
        });
        const booking = await this.apiClient.bookingReservation({
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          availabilityId: availability.result[0].id,
          unitItems: [
            {
              unitId: product.result.options[0].units[0].id,
            },
            {
              unitId: product.result.options[0].units[0].id,
            },
          ],
        });
        return new BookingConfirmationEntityErrorScenario({
          apiClient: this.apiClient,
          uuid: booking.result.uuid,
          unitItems: [
            {
              unitId: "adult",
            },
          ],
          contact: {},
          capabilities: this.config.capabilities,
        }).validate();
      })
    );
  };
}
