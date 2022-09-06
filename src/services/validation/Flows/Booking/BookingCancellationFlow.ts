// import { AvailabilityType } from "@octocloud/types";
// import * as R from "ramda";
// import { BadRequestError } from "../../../../models/Error";
// import { ApiClient } from "../../ApiClient";
// import { Config } from "../../config/Config";
// import { BookingValidateData, ScenarioResult } from "../../Scenarios/Scenario";
// import { FlowResult } from "../Flow";
// import { BookingCancellationReservationScenario } from "../../Scenarios/Booking/Cancellation/BookingCancellationReservation";
// import { BookingCancellationBookingScenario } from "../../Scenarios/Booking/Cancellation/BookingCancellationBooking";
// import { BookingCancellationInvalidUUIDScenario } from "../../Scenarios/Booking/Cancellation/BookingCancellationInvalidUUID";

// export class BookingCancellationFlow {
//   private config: Config;
//   private apiClient: ApiClient;
//   private startTimes: Nullable<BookingValidateData>;
//   private openingHours: Nullable<BookingValidateData>;
//   constructor({ config }: { config: Config }) {
//     this.config = config;
//     this.apiClient = new ApiClient({
//       url: config.url,
//       capabilities: config.capabilities,
//       apiKey: this.config.apiKey,
//     });
//   }

//   private fetchData = async (): Promise<void> => {
//     await Promise.all(
//       this.config.getProductConfigs().map(async (productConfig) => {
//         const optionId =
//           productConfig.optionId ??
//           (
//             await this.apiClient.getProduct({ id: productConfig.productId })
//           ).response.data.body.options.find((option) => option.default).id;
//         const availability = await this.apiClient.getAvailability({
//           productId: productConfig.productId,
//           optionId: optionId,
//           localDateStart: productConfig.available.from,
//           localDateEnd: productConfig.available.to,
//         });
//         if (
//           R.isEmpty(availability.response.data.body) &&
//           !availability.response.error
//         ) {
//           throw new BadRequestError("Invalid available dates!");
//         }
//         const product = (
//           await this.apiClient.getProduct({
//             id: productConfig.productId,
//           })
//         ).response.data.body;

//         if (productConfig.availabilityType === AvailabilityType.START_TIME) {
//           this.startTimes = {
//             productId: productConfig.productId,
//             optionId,
//             availability: availability.response.data.body,
//             product,
//           };
//         } else {
//           this.openingHours = {
//             productId: productConfig.productId,
//             optionId,
//             availability: availability.response.data.body,
//             product,
//           };
//         }
//       })
//     );
//   };

//   private setFlow = (scenarios: ScenarioResult<any>[]): FlowResult => {
//     return {
//       name: "Booking Cancellation",
//       success: scenarios.every((scenario) => scenario.success),
//       totalScenarios: scenarios.length,
//       succesScenarios: scenarios.filter((scenario) => scenario.success).length,
//       scenarios: scenarios,
//     };
//   };

//   public validate = async (): Promise<FlowResult> => {
//     await this.fetchData();

//     const scenarios = [
//       ...(await this.validateBookingCancellationReservation()),
//       ...(await this.validateBookingCancellationBooking()),
//       await this.validateBookingCancellationInvalidUUID(),
//     ];

//     const results = [];
//     for await (const scenario of scenarios) {
//       const result = await scenario.validate();
//       results.push(result);
//       if (!result.success && !this.config.ignoreKill) {
//         break;
//       }
//     }
//     return this.setFlow(results);
//   };

//   private validateBookingCancellationReservation = async (): Promise<
//     BookingCancellationReservationScenario[]
//   > => {
//     return Promise.all(
//       this.config.getProductConfigs().map(async (productConfig) => {
//         const validateData =
//           productConfig.availabilityType === AvailabilityType.OPENING_HOURS
//             ? this.openingHours
//             : this.startTimes;
//         const booking = (
//           await this.apiClient.bookingReservation({
//             productId: validateData.productId,
//             optionId: validateData.optionId,
//             availabilityId: validateData.availability[0].id,
//             unitItems: [
//               {
//                 unitId: validateData.product.options.find(
//                   (option) => option.id === validateData.optionId
//                 ).units[0].id,
//               },
//               {
//                 unitId: validateData.product.options.find(
//                   (option) => option.id === validateData.optionId
//                 ).units[0].id,
//               },
//             ],
//           })
//         ).response.data.body;
//         return new BookingCancellationReservationScenario({
//           apiClient: this.apiClient,
//           uuid: booking.uuid,
//           capabilities: this.config.capabilities,
//           deliveryMethods: productConfig.deliveryMethods,
//           booking,
//         });
//       })
//     );
//   };

//   private validateBookingCancellationBooking = async (): Promise<
//     BookingCancellationBookingScenario[]
//   > => {
//     return Promise.all(
//       this.config.getProductConfigs().map(async (productConfig) => {
//         const validateData =
//           productConfig.availabilityType === AvailabilityType.OPENING_HOURS
//             ? this.openingHours
//             : this.startTimes;
//         const booking = (
//           await this.apiClient.bookingReservation({
//             productId: validateData.productId,
//             optionId: validateData.optionId,
//             availabilityId: validateData.availability[0].id,
//             unitItems: [
//               {
//                 unitId: validateData.product.options.find(
//                   (option) => option.id === validateData.optionId
//                 ).units[0].id,
//               },
//               {
//                 unitId: validateData.product.options.find(
//                   (option) => option.id === validateData.optionId
//                 ).units[0].id,
//               },
//             ],
//           })
//         ).response.data.body;
//         const bookingConfirmed = (
//           await this.apiClient.bookingConfirmation({
//             uuid: booking.uuid,
//             contact: {
//               fullName: "John Doe",
//             },
//           })
//         ).response.data.body;
//         return new BookingCancellationBookingScenario({
//           apiClient: this.apiClient,
//           uuid: bookingConfirmed.uuid,
//           capabilities: this.config.capabilities,
//           deliveryMethods: productConfig.deliveryMethods,
//           booking: bookingConfirmed,
//         });
//       })
//     );
//   };

//   private validateBookingCancellationInvalidUUID =
//     async (): Promise<BookingCancellationInvalidUUIDScenario> => {
//       return new BookingCancellationInvalidUUIDScenario({
//         apiClient: this.apiClient,
//         uuid: "invalid_UUID",
//         capabilities: this.config.capabilities,
//       });
//     };
// }
