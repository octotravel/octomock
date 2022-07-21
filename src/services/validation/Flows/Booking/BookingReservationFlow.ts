import { Booking } from "@octocloud/types";
import R from "ramda";
import { BadRequestError } from "../../../../models/Error";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenario";
import { BookingReservationScenario } from "../../Scenarios/Booking/Reservation/BookingReservation";
import { BookingReservationAvailabilityIdErrorScenario } from "../../Scenarios/Booking/Reservation/BookingReservationAvailabilityIdError";
import { BookingReservationEntityErrorScenario } from "../../Scenarios/Booking/Reservation/BookingReservationEntityError";
import { BookingReservationOptionIdErrorScenario } from "../../Scenarios/Booking/Reservation/BookingReservationOptionIdError";
import { BookingReservationProductIdErrorScenario } from "../../Scenarios/Booking/Reservation/BookingReservationProductIdError";
import { BookingReservationUnitIdErrorScenario } from "../../Scenarios/Booking/Reservation/BookingReservationUnitIdError";
import { Flow } from "../Flow";

export class BookingReservationFlow {
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
    const bookingProductIdError = await this.validateBookingProductIdError();
    const bookingOptionIdError = await this.validateBookingOptionIdError();
    const bookingAvailabilityIdError =
      await this.validateBookingAvailabilityIdError();
    const bookingEntityError = await this.validateBookingEntityError();
    const bookingUnitIdError = await this.validateBookingUnitIdError();
    const scenarios = [
      ...booking,
      ...bookingProductIdError,
      ...bookingOptionIdError,
      ...bookingAvailabilityIdError,
      ...bookingEntityError,
      ...bookingUnitIdError,
    ];
    return {
      name: "Booking Reservation Flow",
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
        if (R.isEmpty(availability.result) && !availability.error) {
          throw new BadRequestError("Invalid available dates!");
        }
        const product = await this.apiClient.getProduct({
          id: availabilityConfig.productId,
        });
        return new BookingReservationScenario({
          apiClient: this.apiClient,
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
          capabilities: this.config.capabilities,
        }).validate();
      })
    );
  };

  private validateBookingProductIdError = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        const availability = await this.apiClient.getAvailability({
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          localDateStart: availabilityConfig.available.from,
          localDateEnd: availabilityConfig.available.to,
        });
        if (R.isEmpty(availability.result) && !availability.error) {
          throw new BadRequestError("Invalid available dates!");
        }
        const product = await this.apiClient.getProduct({
          id: availabilityConfig.productId,
        });
        return new BookingReservationProductIdErrorScenario({
          apiClient: this.apiClient,
          productId: "bad product Id",
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
          capabilities: this.config.capabilities,
        }).validate();
      })
    );
  };

  private validateBookingOptionIdError = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        const availability = await this.apiClient.getAvailability({
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          localDateStart: availabilityConfig.available.from,
          localDateEnd: availabilityConfig.available.to,
        });
        if (R.isEmpty(availability.result) && !availability.error) {
          throw new BadRequestError("Invalid available dates!");
        }
        const product = await this.apiClient.getProduct({
          id: availabilityConfig.productId,
        });
        return new BookingReservationOptionIdErrorScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: "bad optionId",
          availabilityId: availability.result[0].id,
          unitItems: [
            {
              unitId: product.result.options[0].units[0].id,
            },
            {
              unitId: product.result.options[0].units[0].id,
            },
          ],
          capabilities: this.config.capabilities,
        }).validate();
      })
    );
  };

  private validateBookingAvailabilityIdError = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        const product = await this.apiClient.getProduct({
          id: availabilityConfig.productId,
        });
        return new BookingReservationAvailabilityIdErrorScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          availabilityId: "bad availability id",
          unitItems: [
            {
              unitId: product.result.options[0].units[0].id,
            },
            {
              unitId: product.result.options[0].units[0].id,
            },
          ],
          capabilities: this.config.capabilities,
        }).validate();
      })
    );
  };

  private validateBookingEntityError = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        const availability = await this.apiClient.getAvailability({
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          localDateStart: availabilityConfig.available.from,
          localDateEnd: availabilityConfig.available.to,
        });
        if (R.isEmpty(availability.result) && !availability.error) {
          throw new BadRequestError("Invalid available dates!");
        }
        return new BookingReservationEntityErrorScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          availabilityId: availability.result[0].id,
          unitItems: [],
          capabilities: this.config.capabilities,
        }).validate();
      })
    );
  };

  private validateBookingUnitIdError = async (): Promise<
    ScenarioResult<null>[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        const availability = await this.apiClient.getAvailability({
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          localDateStart: availabilityConfig.available.from,
          localDateEnd: availabilityConfig.available.to,
        });
        if (R.isEmpty(availability.result) && !availability.error) {
          throw new BadRequestError("Invalid available dates!");
        }
        return new BookingReservationUnitIdErrorScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          availabilityId: availability.result[0].id,
          unitItems: [
            {
              unitId: "bad unitId",
            },
            {
              unitId: "bad unitId",
            },
          ],
          capabilities: this.config.capabilities,
        }).validate();
      })
    );
  };
}
