import { Booking } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenario";
import { BookingGetScenario } from "../../Scenarios/Booking/Get/BookingGet";
import { BookingGetErrorScenario } from "../../Scenarios/Booking/Get/BookingGetError";
import { Flow } from "../Flow";

export class BookingGetFlow {
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
    const bookingError = await this.validateBookingError();
    const scenarios = [...booking, bookingError];
    return {
      name: "Booking Get Flow",
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
        return new BookingGetScenario({
          apiClient: this.apiClient,
          uuid: booking.result.uuid,
          capabilities: this.config.capabilities,
        }).validate();
      })
    );
  };

  private validateBookingError = async (): Promise<ScenarioResult<null>> => {
    return await new BookingGetErrorScenario({
      apiClient: this.apiClient,
      uuid: "bad uuid",
    }).validate();
  };
}
