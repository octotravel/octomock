import { Booking } from "@octocloud/types";
import R from "ramda";
import { BadRequestError } from "../../../../models/Error";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenario";
import { BookingListErrorScenario } from "../../Scenarios/Booking/List/BookingListError";
import { BookingListResellerScenario } from "../../Scenarios/Booking/List/BookingListReseller";
import { BookingListSupplierScenario } from "../../Scenarios/Booking/List/BookingListSupplier";
import { Flow } from "../Flow";

export class BookingListFlow {
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
    const bookingReseller = await this.validateBookingReseller();
    const bookingSupplier = await this.validateBookingSupplier();
    const bookingError = await this.validateBookingError();
    const scenarios = [...bookingReseller, ...bookingSupplier, bookingError];
    return {
      name: "Booking List Flow",
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      success: scenarios.every((scenario) => scenario.success),
      scenarios: scenarios,
    };
  };

  private validateBookingReseller = async (): Promise<
    ScenarioResult<Booking[]>[]
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
        const booking = await this.apiClient.bookingReservation({
          productId: availabilityConfig.productId,
          optionId: availabilityConfig.optionId,
          availabilityId: availability.result[0].id,
          resellerReference: "testReference",
          unitItems: [
            {
              unitId: product.result.options[0].units[0].id,
            },
            {
              unitId: product.result.options[0].units[0].id,
            },
          ],
        });
        return new BookingListResellerScenario({
          apiClient: this.apiClient,
          resellerReference: booking.result.resellerReference,
          capabilities: this.config.capabilities,
        }).validate();
      })
    );
  };

  private validateBookingSupplier = async (): Promise<
    ScenarioResult<Booking[]>[]
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
        return new BookingListSupplierScenario({
          apiClient: this.apiClient,
          supplierReference: booking.result.supplierReference,
          capabilities: this.config.capabilities,
        }).validate();
      })
    );
  };

  private validateBookingError = async (): Promise<ScenarioResult<null>> => {
    return await new BookingListErrorScenario({
      apiClient: this.apiClient,
    }).validate();
  };
}
