import { AvailabilityType } from "@octocloud/types";
import R from "ramda";
import { BadRequestError } from "../../../../models/Error";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { ScenarioResult } from "../../Scenarios/Scenario";
import { BookingReservationScenario } from "../../Scenarios/Booking/Reservation/BookingReservation";
import { FlowResult } from "../Flow";
import { BookingReservationInvalidProductScenario } from "../../Scenarios/Booking/Reservation/BookingReservationInvalidProduct";
import { BookingReservationInvalidOptionScenario } from "../../Scenarios/Booking/Reservation/BookingReservationInvalidOption";
import { BookingReservationInvalidAvailabilityIdScenario } from "../../Scenarios/Booking/Reservation/BookingReservationInvalidAvailabilityId";
import { BookingReservationMissingUnitItemsScenario } from "../../Scenarios/Booking/Reservation/BookingReservationMissingUnitItems";
import { BookingReservationEmptyUnitItemsScenario } from "../../Scenarios/Booking/Reservation/BookingReservationEmptyUnitItems";
import { BookingReservationInvalidUnitIdScenario } from "../../Scenarios/Booking/Reservation/BookingReservationInvalidUnitId";

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

    const scenarios = [
      ...(await this.validateBooking()),
      ...(await this.validateBookingInvalidProduct()),
      ...(await this.validateBookingInvalidOption()),
      ...(await this.validateBookingInvalidAvailabilityId()),
      ...(await this.validateBookingnMissingUnitItems()),
      ...(await this.validateBookingEmptyUnitItems()),
      ...(await this.validateBookingInvalidUnitId()),
    ];

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
        const product = (
          await this.apiClient.getProduct({
            id: availabilityConfig.productId,
          })
        ).response.data.body;
        let unitItems = [
          {
            unitId: product.options[0].units[0].id,
          },
          {
            unitId: product.options[0].units[0].id,
          },
          {
            unitId: product.options[0].units[0].id,
          },
        ];
        if (product.options[0].units[1]) {
          unitItems = [
            ...unitItems,
            {
              unitId: product.options[0].units[1].id,
            },
          ];
        }
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
          unitItems,
          notes: "Test note",
          capabilities: this.config.capabilities,
          deliveryMethods: availabilityConfig.deliveryMethods,
        });
      })
    );
  };

  private validateBookingInvalidProduct = async (): Promise<
    BookingReservationInvalidProductScenario[]
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
        if (R.isEmpty(availability.data.body) && !availability.error) {
          throw new BadRequestError("Invalid available dates!");
        }
        const product = (
          await this.apiClient.getProduct({
            id: availabilityConfig.productId,
          })
        ).response.data.body;
        return new BookingReservationInvalidProductScenario({
          apiClient: this.apiClient,
          productId: "Invalid productId",
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
          capabilities: this.config.capabilities,
        });
      })
    );
  };

  private validateBookingInvalidOption = async (): Promise<
    BookingReservationInvalidOptionScenario[]
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
        if (R.isEmpty(availability.data.body) && !availability.error) {
          throw new BadRequestError("Invalid available dates!");
        }
        const product = (
          await this.apiClient.getProduct({
            id: availabilityConfig.productId,
          })
        ).response.data.body;
        return new BookingReservationInvalidOptionScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId: "Invalid optionId",
          availabilityId: availability.data.body[0].id,
          unitItems: [
            {
              unitId: product.options[0].units[0].id,
            },
            {
              unitId: product.options[0].units[0].id,
            },
          ],
          capabilities: this.config.capabilities,
        });
      })
    );
  };

  private validateBookingInvalidAvailabilityId = async (): Promise<
    BookingReservationInvalidAvailabilityIdScenario[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (availabilityConfig) => {
        const product = (
          await this.apiClient.getProduct({
            id: availabilityConfig.productId,
          })
        ).response.data.body;
        return new BookingReservationInvalidAvailabilityIdScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId:
            availabilityConfig.availabilityType ===
            AvailabilityType.OPENING_HOURS
              ? this.optionIdOpeningHours
              : this.optionIdStartTimes,
          availabilityId: "Invalid availabilityId",
          unitItems: [
            {
              unitId: product.options[0].units[0].id,
            },
            {
              unitId: product.options[0].units[0].id,
            },
          ],
          capabilities: this.config.capabilities,
        });
      })
    );
  };

  private validateBookingnMissingUnitItems = async (): Promise<
    BookingReservationMissingUnitItemsScenario[]
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
        if (R.isEmpty(availability.data.body) && !availability.error) {
          throw new BadRequestError("Invalid available dates!");
        }
        return new BookingReservationMissingUnitItemsScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId:
            availabilityConfig.availabilityType ===
            AvailabilityType.OPENING_HOURS
              ? this.optionIdOpeningHours
              : this.optionIdStartTimes,
          availabilityId: availability.data.body[0].id,
          unitItems: [],
          capabilities: this.config.capabilities,
        });
      })
    );
  };

  private validateBookingEmptyUnitItems = async (): Promise<
    BookingReservationEmptyUnitItemsScenario[]
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
        if (R.isEmpty(availability.data.body) && !availability.error) {
          throw new BadRequestError("Invalid available dates!");
        }
        return new BookingReservationEmptyUnitItemsScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId:
            availabilityConfig.availabilityType ===
            AvailabilityType.OPENING_HOURS
              ? this.optionIdOpeningHours
              : this.optionIdStartTimes,
          availabilityId: availability.data.body[0].id,
          unitItems: [],
          capabilities: this.config.capabilities,
        });
      })
    );
  };

  private validateBookingInvalidUnitId = async (): Promise<
    BookingReservationInvalidUnitIdScenario[]
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
        if (R.isEmpty(availability.data.body) && !availability.error) {
          throw new BadRequestError("Invalid available dates!");
        }
        return new BookingReservationInvalidUnitIdScenario({
          apiClient: this.apiClient,
          productId: availabilityConfig.productId,
          optionId:
            availabilityConfig.availabilityType ===
            AvailabilityType.OPENING_HOURS
              ? this.optionIdOpeningHours
              : this.optionIdStartTimes,
          availabilityId: availability.data.body[0].id,
          unitItems: [
            {
              unitId: "invalid unitId",
            },
            {
              unitId: "invalid unitId",
            },
          ],
          capabilities: this.config.capabilities,
        });
      })
    );
  };
}
