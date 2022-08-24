import { AvailabilityType } from "@octocloud/types";
import R from "ramda";
import { BadRequestError } from "../../../../models/Error";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import { BookingValidateData, ScenarioResult } from "../../Scenarios/Scenario";
import { FlowResult } from "../Flow";
import { BookingListSupplierReferenceScenario } from "../../Scenarios/Booking/List/BookingListSupplierReference";
import { BookingListResellerReferenceScenario } from "../../Scenarios/Booking/List/BookingListResellerReference";
import { BookingListBadRequestScenario } from "../../Scenarios/Booking/List/BookingListBadRequest";
import { DateHelper } from "../../../../helpers/DateHelper";

export class BookingListFlow {
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
      name: "List Booking",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<FlowResult> => {
    await this.fetchData();

    const scenarios = [
      ...(await this.validateListBookingsSupplierReference()),
      ...(await this.validateListBookingsResellerReference()),
      await this.validateListBookingBadRequestError(),
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

  private validateListBookingsSupplierReference = async (): Promise<
    BookingListSupplierReferenceScenario[]
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
                unitId: validateData.product.options[0].units[0].id,
              },
              {
                unitId: validateData.product.options[0].units[0].id,
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
        return new BookingListSupplierReferenceScenario({
          apiClient: this.apiClient,
          supplierReference: confirmedBooking.supplierReference,
          capabilities: this.config.capabilities,
        });
      })
    );
  };

  private validateListBookingsResellerReference = async (): Promise<
    BookingListResellerReferenceScenario[]
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
                unitId: validateData.product.options[0].units[0].id,
              },
              {
                unitId: validateData.product.options[0].units[0].id,
              },
            ],
          })
        ).response.data.body;
        const resellerReference = `Test Reference - ${DateHelper.getDate(
          new Date().toISOString()
        )}`;
        await this.apiClient.bookingConfirmation({
          uuid: booking.uuid,
          contact: {
            fullName: "John Doe",
          },
          resellerReference,
        });
        return new BookingListResellerReferenceScenario({
          apiClient: this.apiClient,
          resellerReference,
          capabilities: this.config.capabilities,
        });
      })
    );
  };

  private validateListBookingBadRequestError =
    async (): Promise<BookingListBadRequestScenario> => {
      return new BookingListBadRequestScenario({
        apiClient: this.apiClient,
      });
    };
}
