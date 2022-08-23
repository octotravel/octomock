import { AvailabilityType, Booking } from "@octocloud/types";
import R from "ramda";
import { BadRequestError } from "../../../../models/Error";
import { ApiClient } from "../../ApiClient";
import { Config } from "../../config/Config";
import {
  BookingValidateData,
  Scenario,
  ScenarioResult,
} from "../../Scenarios/Scenario";
import { FlowResult } from "../Flow";
// import { BookingUpdateDateScenario } from "../../Scenarios/Booking/Update/BookingUpdateDate";
import { BookingUpdateUnitItemsScenario } from "../../Scenarios/Booking/Update/BookingUpdateUnitItems";
import { BookingUpdateContactScenario } from "../../Scenarios/Booking/Update/BookingUpdateContact";
import { BookingUpdateProductScenario } from "../../Scenarios/Booking/Update/BookingUpdateProduct";

export class BookingUpdateFlow {
  private config: Config;
  private apiClient: ApiClient;
  private startTimes: Nullable<BookingValidateData>;
  private openingHours: Nullable<BookingValidateData>;
  constructor({ config }: { config: Config }) {
    this.config = config;
    this.apiClient = new ApiClient({
      url: config.url,
      capabilities: config.capabilities,
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

        const availabilityFrom = (
          await this.apiClient.getAvailability({
            productId: productConfig.productId,
            optionId,
            localDate: productConfig.available.from,
          })
        ).response;
        if (R.isEmpty(availabilityFrom.data) && !availabilityFrom.error) {
          throw new BadRequestError("Invalid available dates!");
        }
        const availabilityTo = (
          await this.apiClient.getAvailability({
            productId: productConfig.productId,
            optionId,
            localDate: productConfig.available.to,
          })
        ).response;
        if (R.isEmpty(availabilityTo.data) && !availabilityTo.error) {
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
            availabilityFrom: availabilityFrom.data.body,
            availabilityTo: availabilityTo.data.body,
          };
        } else {
          this.openingHours = {
            productId: productConfig.productId,
            optionId,
            availability: availability.response.data.body,
            product,
            availabilityFrom: availabilityFrom.data.body,
            availabilityTo: availabilityTo.data.body,
          };
        }
      })
    );
  };

  private setFlow = (scenarios: ScenarioResult<any>[]): FlowResult => {
    return {
      name: "Booking Update",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<FlowResult> => {
    await this.fetchData();

    let scenarios: Scenario<Booking>[] = [
      // ...(await this.validateBookingUpdateDate()),
      ...(await this.validateBookingUpdateUnitItems()),
      ...(await this.validateBookingUpdateContact()),
    ];

    if (this.config.getProductConfigs().length > 1) {
      scenarios = [...scenarios, await this.validateBookingUpdateProduct()];
    }

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

  // private validateBookingUpdateDate = async (): Promise<BookingUpdateDateScenario[]
  // > => {
  //   return Promise.all(
  //     this.config.getProductConfigs().map(async (productConfig) => {
  //       const validateData =
  //         productConfig.availabilityType === AvailabilityType.OPENING_HOURS
  //           ? this.openingHours
  //           : this.startTimes;

  //       const booking = (
  //         await this.apiClient.bookingReservation({
  //           productId: validateData.productId,
  //           optionId: validateData.optionId,
  //           availabilityId: validateData.availabilityFrom[0].id,
  //           unitItems: [
  //             {
  //               unitId: validateData.product.options[0].units[0].id,
  //             },
  //             {
  //               unitId: validateData.product.options[0].units[0].id,
  //             },
  //           ],
  //         })
  //       ).response.data.body;
  //       return new BookingUpdateDateScenario({
  //         apiClient: this.apiClient,
  //         uuid: booking.uuid,
  //         availabilityId: validateData.availabilityTo[0].id,
  //         capabilities: this.config.capabilities,
  //         deliveryMethods: productConfig.deliveryMethods,
  //         booking,
  //       });
  //     })
  //   );
  // };

  private validateBookingUpdateUnitItems = async (): Promise<
    BookingUpdateUnitItemsScenario[]
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
        return new BookingUpdateUnitItemsScenario({
          apiClient: this.apiClient,
          uuid: booking.uuid,
          unitItems: [
            {
              unitId: validateData.product.options[0].units[0].id,
            },
            {
              unitId: validateData.product.options[0].units[0].id,
            },
            {
              unitId: validateData.product.options[0].units[0].id,
            },
          ],
          capabilities: this.config.capabilities,
          deliveryMethods: productConfig.deliveryMethods,
          booking,
        });
      })
    );
  };

  private validateBookingUpdateContact = async (): Promise<
    BookingUpdateContactScenario[]
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
        return new BookingUpdateContactScenario({
          apiClient: this.apiClient,
          uuid: booking.uuid,
          contact: {
            fullName: "John Doe",
            firstName: "John",
            lastName: "Doe",
            emailAddress: "johndoe@mail.com",
            phoneNumber: "+00000000",
            country: "France",
            notes: "Test notes contact",
            locales: ["en"],
          },
          notes: "Test note",
          capabilities: this.config.capabilities,
          deliveryMethods: productConfig.deliveryMethods,
          booking,
        });
      })
    );
  };

  private validateBookingUpdateProduct =
    async (): Promise<BookingUpdateProductScenario> => {
      const products = this.config.getProductConfigs();
      const booking = (
        await this.apiClient.bookingReservation({
          productId: this.startTimes.productId,
          optionId: this.startTimes.optionId,
          availabilityId: this.startTimes.availabilityFrom[0].id,
          unitItems: [
            {
              unitId: this.startTimes.product.options[0].units[0].id,
            },
            {
              unitId: this.startTimes.product.options[0].units[0].id,
            },
          ],
        })
      ).response.data.body;
      return new BookingUpdateProductScenario({
        apiClient: this.apiClient,
        uuid: booking.uuid,
        productId: this.openingHours.productId,
        optionId: this.openingHours.optionId,
        unitItems: [
          {
            unitId: this.openingHours.product.options[0].units[0].id,
          },
          {
            unitId: this.openingHours.product.options[0].units[0].id,
          },
        ],
        availabilityId: this.openingHours.availabilityTo[0].id,
        capabilities: this.config.capabilities,
        deliveryMethods: products.find(
          (product) => product.productId === this.openingHours.productId
        ).deliveryMethods,
        booking,
      });
    };
}
