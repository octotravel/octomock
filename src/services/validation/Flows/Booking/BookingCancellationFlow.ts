import { Booking } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenario";
import { BookingCancellationScenario } from "../../Scenarios/Booking/Cancellation/BookingCancellation";
import { Flow } from "../Flow";

export class BookingCancellationFlow {
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
    const scenarios = [...booking];
    return {
      name: "Booking Cancellation Flow",
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
        return new BookingCancellationScenario({
          apiClient: this.apiClient,
          uuid: booking.result.uuid,
          capabilities: this.config.capabilities,
        }).validate();
      })
    );
  };
}
