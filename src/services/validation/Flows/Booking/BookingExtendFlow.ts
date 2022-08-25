import { AvailabilityType } from "@octocloud/types";
import R from "ramda";
import { BadRequestError } from "../../../../models/Error";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { BookingValidateData, ScenarioResult } from "../../Scenarios/Scenario";
import { FlowResult } from "../Flow";
import { BookingReservationExtendScenario } from "../../Scenarios/Booking/Extend/BookingReservationExtend";
// import { BookingReservationExtendInvalidUUIDScenario } from "../../Scenarios/Booking/Extend/BookingReservationExtendInvalidUUID";

export class BookingExtendFlow {
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
      name: "Extend Reservation",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<FlowResult> => {
    await this.fetchData();

    const scenarios = [
      ...(await this.validateBookingExtend()),
      // await this.validateBookingExtendInvalidUUID(),
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

  private validateBookingExtend = async (): Promise<
    BookingReservationExtendScenario[]
  > => {
    return Promise.all(
      this.config.getProductConfigs().map(async (productConfig) => {
        const validateData =
          productConfig.availabilityType === AvailabilityType.OPENING_HOURS
            ? this.openingHours
            : this.startTimes;
        let unitItems = [
          {
            unitId: validateData.product.options[0].units[0].id,
          },
          {
            unitId: validateData.product.options[0].units[0].id,
          },
          {
            unitId: validateData.product.options[0].units[0].id,
          },
        ];
        if (validateData.product.options[0].units[1]) {
          unitItems = [
            ...unitItems,
            {
              unitId: validateData.product.options[0].units[1].id,
            },
          ];
        }
        const booking = (
          await this.apiClient.bookingReservation({
            productId: validateData.productId,
            optionId: validateData.optionId,
            availabilityId: validateData.availability[0].id,
            unitItems,
          })
        ).response.data.body;
        return new BookingReservationExtendScenario({
          apiClient: this.apiClient,
          availabilityType: productConfig.availabilityType,
          capabilities: this.config.capabilities,
          deliveryMethods: productConfig.deliveryMethods,
          booking,
        });
      })
    );
  };

  // private validateBookingExtendInvalidUUID =
  //   async (): Promise<BookingReservationExtendInvalidUUIDScenario> => {
  //     return new BookingReservationExtendInvalidUUIDScenario({
  //       apiClient: this.apiClient,
  //       uuid: "Invalid booking UUID",
  //     });
  //   };
}
