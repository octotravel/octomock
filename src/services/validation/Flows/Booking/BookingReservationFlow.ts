import { AvailabilityType, CapabilityId } from "@octocloud/types";
import R from "ramda";
import { BadRequestError } from "../../../../models/Error";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { BookingValidateData, ScenarioResult } from "../../Scenarios/Scenario";
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

        // if (this.config.capabilities.includes(CapabilityId.Pickups)) {
        //   if (R.isEmpty(product.options.find(option => option.id === optionId).pickupPoints)) {
        //     throw new BadRequestError(`No available Pickup Points for product ${product.id}`)
        //   }
        // }

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
      name: "Booking Reservation",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<FlowResult> => {
    await this.fetchData();

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
      if (!result.success && !this.config.ignoreKill) {
        break;
      }
    }
    return this.setFlow(results);
  };

  private validateBooking = async (): Promise<BookingReservationScenario[]> => {
    return Promise.all(
      this.config.getProductConfigs().map(async (productConfig) => {
        const validateData =
          productConfig.availabilityType === AvailabilityType.OPENING_HOURS
            ? this.openingHours
            : this.startTimes;
        let unitItems = [
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
          {
            unitId: validateData.product.options.find(
              (option) => option.id === validateData.optionId
            ).units[0].id,
          },
        ];
        if (
          validateData.product.options.find(
            (option) => option.id === validateData.optionId
          ).units[1]
        ) {
          unitItems = [
            ...unitItems,
            {
              unitId: validateData.product.options.find(
                (option) => option.id === validateData.optionId
              ).units[1].id,
            },
          ];
        }

        const bookingData = {
          productId: validateData.productId,
          optionId: validateData.optionId,
          availabilityId: validateData.availability[0].id,
          unitItems,
          notes: "Test note",
          apiClient: this.apiClient,
          deliveryMethods: productConfig.deliveryMethods,
          availabilityType: productConfig.availabilityType,
          capabilities: this.config.capabilities,
        };

        if (this.config.capabilities.includes(CapabilityId.Pickups)) {
          return new BookingReservationScenario({
            ...bookingData,
            pickupPointId: validateData.product.options.find(
              (option) => option.id === validateData.optionId
            ).pickupPoints[0]
              ? validateData.product.options.find(
                  (option) => option.id === validateData.optionId
                ).pickupPoints[0].id
              : "",
          });
        }
        return new BookingReservationScenario(bookingData);
      })
    );
  };

  private validateBookingInvalidProduct = async (): Promise<
    BookingReservationInvalidProductScenario[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (productConfig) => {
        const validateData =
          productConfig.availabilityType === AvailabilityType.OPENING_HOURS
            ? this.openingHours
            : this.startTimes;
        return new BookingReservationInvalidProductScenario({
          apiClient: this.apiClient,
          productId: "Invalid productId",
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
          capabilities: this.config.capabilities,
        });
      })
    );
  };

  private validateBookingInvalidOption = async (): Promise<
    BookingReservationInvalidOptionScenario[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (productConfig) => {
        const validateData =
          productConfig.availabilityType === AvailabilityType.OPENING_HOURS
            ? this.openingHours
            : this.startTimes;
        return new BookingReservationInvalidOptionScenario({
          apiClient: this.apiClient,
          productId: validateData.productId,
          optionId: "Invalid optionId",
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
          capabilities: this.config.capabilities,
        });
      })
    );
  };

  private validateBookingInvalidAvailabilityId = async (): Promise<
    BookingReservationInvalidAvailabilityIdScenario[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (productConfig) => {
        const validateData =
          productConfig.availabilityType === AvailabilityType.OPENING_HOURS
            ? this.openingHours
            : this.startTimes;
        return new BookingReservationInvalidAvailabilityIdScenario({
          apiClient: this.apiClient,
          productId: validateData.productId,
          optionId: validateData.optionId,
          availabilityId: "Invalid availabilityId",
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
          capabilities: this.config.capabilities,
        });
      })
    );
  };

  private validateBookingnMissingUnitItems = async (): Promise<
    BookingReservationMissingUnitItemsScenario[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (productConfig) => {
        const validateData =
          productConfig.availabilityType === AvailabilityType.OPENING_HOURS
            ? this.openingHours
            : this.startTimes;
        return new BookingReservationMissingUnitItemsScenario({
          apiClient: this.apiClient,
          productId: validateData.productId,
          optionId: validateData.optionId,
          availabilityId: validateData.availability[0].id,
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
      this.config.getProductConfigs().map(async (productConfig) => {
        const validateData =
          productConfig.availabilityType === AvailabilityType.OPENING_HOURS
            ? this.openingHours
            : this.startTimes;
        return new BookingReservationEmptyUnitItemsScenario({
          apiClient: this.apiClient,
          productId: validateData.productId,
          optionId: validateData.optionId,
          availabilityId: validateData.availability[0].id,
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
      this.config.getProductConfigs().map(async (productConfig) => {
        const validateData =
          productConfig.availabilityType === AvailabilityType.OPENING_HOURS
            ? this.openingHours
            : this.startTimes;
        return new BookingReservationInvalidUnitIdScenario({
          apiClient: this.apiClient,
          productId: validateData.productId,
          optionId: validateData.optionId,
          availabilityId: validateData.availability[0].id,
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
