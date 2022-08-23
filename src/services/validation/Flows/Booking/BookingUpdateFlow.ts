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
// import { BookingUpdateProductScenario } from "../../Scenarios/Booking/Update/BookingUpdateProduct";

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
      name: "Booking Update",
      success: scenarios.every((scenario) => scenario.success),
      totalScenarios: scenarios.length,
      succesScenarios: scenarios.filter((scenario) => scenario.success).length,
      scenarios: scenarios,
    };
  };

  public validate = async (): Promise<FlowResult> => {
    await this.fetchData();

    const scenarios: Scenario<Booking>[] = [
      // ...(await this.validateBookingUpdateDate()),
      ...(await this.validateBookingUpdateUnitItems()),
      ...(await this.validateBookingUpdateContact()),
    ];

    // if (this.config.getProductConfigs().length > 1) {
    //   scenarios = [
    //     ...scenarios,
    //     await this.validateBookingUpdateProduct(),
    //   ]
    // }

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
  //     this.config.getProductConfigs().map(async (availabilityConfig) => {
  //       const availabilityFrom = (
  //         await this.apiClient.getAvailability({
  //           productId: availabilityConfig.productId,
  //           optionId:
  //             availabilityConfig.availabilityType ===
  //             AvailabilityType.OPENING_HOURS
  //               ? this.optionIdOpeningHours
  //               : this.optionIdStartTimes,
  //           localDate: availabilityConfig.available.from,
  //         })
  //       ).response;
  //       if (R.isEmpty(availabilityFrom.data) && !availabilityFrom.error) {
  //         throw new BadRequestError("Invalid available dates!");
  //       }
  //       const availabilityTo = (
  //         await this.apiClient.getAvailability({
  //           productId: availabilityConfig.productId,
  //           optionId:
  //             availabilityConfig.availabilityType ===
  //             AvailabilityType.OPENING_HOURS
  //               ? this.optionIdOpeningHours
  //               : this.optionIdStartTimes,
  //           localDate: availabilityConfig.available.to,
  //         })
  //       ).response;
  //       if (R.isEmpty(availabilityTo.data) && !availabilityTo.error) {
  //         throw new BadRequestError("Invalid available dates!");
  //       }
  //       const product = (
  //         await this.apiClient.getProduct({
  //           id: availabilityConfig.productId,
  //         })
  //       ).response.data.body;
  //       const booking = (
  //         await this.apiClient.bookingReservation({
  //           productId: availabilityConfig.productId,
  //           optionId:
  //             availabilityConfig.availabilityType ===
  //             AvailabilityType.OPENING_HOURS
  //               ? this.optionIdOpeningHours
  //               : this.optionIdStartTimes,
  //           availabilityId: availabilityFrom.data.body[0].id,
  //           unitItems: [
  //             {
  //               unitId: product.options[0].units[0].id,
  //             },
  //             {
  //               unitId: product.options[0].units[0].id,
  //             },
  //           ],
  //         })
  //       ).response.data.body;
  //       return new BookingUpdateDateScenario({
  //         apiClient: this.apiClient,
  //         uuid: booking.uuid,
  //         availabilityId: availabilityTo.data.body[0].id,
  //         capabilities: this.config.capabilities,
  //         deliveryMethods: availabilityConfig.deliveryMethods,
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

  // private validateBookingUpdateProduct = async (): Promise<BookingUpdateProductScenario> => {
  //   const products = this.config.getProductConfigs()
  //   const availabilityFrom = (
  //     await this.apiClient.getAvailability({
  //       productId: products[0].productId,
  //       optionId:
  //       products[0].availabilityType ===
  //         AvailabilityType.OPENING_HOURS
  //           ? this.optionIdOpeningHours
  //           : this.optionIdStartTimes,
  //       localDate: products[0].available.from,
  //     })
  //   ).response;
  //   if (R.isEmpty(availabilityFrom.data) && !availabilityFrom.error) {
  //     throw new BadRequestError("Invalid available dates!");
  //   }
  //   const availabilityTo = (
  //     await this.apiClient.getAvailability({
  //       productId: products[1].productId,
  //       optionId:
  //       products[1].availabilityType ===
  //         AvailabilityType.OPENING_HOURS
  //           ? this.optionIdOpeningHours
  //           : this.optionIdStartTimes,
  //       localDate: products[1].available.from,
  //     })
  //   ).response;
  //   if (R.isEmpty(availabilityTo.data) && !availabilityTo.error) {
  //     throw new BadRequestError("Invalid available dates!");
  //   }
  //   const product1 = (
  //     await this.apiClient.getProduct({
  //       id: products[0].productId,
  //     })
  //   ).response.data.body;
  //   const product2 = (
  //     await this.apiClient.getProduct({
  //       id: products[1].productId,
  //     })
  //   ).response.data.body;
  //   const booking = (
  //     await this.apiClient.bookingReservation({
  //       productId: products[0].productId,
  //       optionId:
  //       products[0].availabilityType ===
  //         AvailabilityType.OPENING_HOURS
  //           ? this.optionIdOpeningHours
  //           : this.optionIdStartTimes,
  //       availabilityId: availabilityFrom.data.body[0].id,
  //       unitItems: [
  //         {
  //           unitId: product1.options[0].units[0].id,
  //         },
  //         {
  //           unitId: product1.options[0].units[0].id,
  //         },
  //       ],
  //     })
  //   ).response.data.body;
  //   return new BookingUpdateProductScenario({
  //     apiClient: this.apiClient,
  //     uuid: booking.uuid,
  //     productId: products[1].productId,
  //     optionId: products[1].availabilityType ===
  //     AvailabilityType.OPENING_HOURS
  //       ? this.optionIdOpeningHours
  //       : this.optionIdStartTimes,
  //     unitItems: [
  //       {
  //         unitId: product2.options[0].units[0].id,
  //       },
  //       {
  //         unitId: product2.options[0].units[0].id,
  //       },
  //     ],
  //     availabilityId: availabilityTo.data.body[0].id,
  //     capabilities: this.config.capabilities,
  //     deliveryMethods: products[1].deliveryMethods,
  //     booking,
  //   });
  // };
}
