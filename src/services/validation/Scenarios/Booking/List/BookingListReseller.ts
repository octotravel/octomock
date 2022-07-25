// import * as R from "ramda";
// import { Booking, CapabilityId } from "@octocloud/types";
// import { ApiClient } from "../../../ApiClient";
// import { Scenario } from "../../Scenario";
// import { BookingValidator } from "../../../../../validators/backendValidator/Booking/BookingValidator";

// export class BookingListResellerScenario implements Scenario<Booking[]> {
//   private apiClient: ApiClient;
//   private resellerReference: string;
//   private capabilities: CapabilityId[];
//   constructor({
//     apiClient,
//     resellerReference,
//     capabilities,
//   }: {
//     apiClient: ApiClient;
//     resellerReference: string;
//     capabilities: CapabilityId[];
//   }) {
//     this.apiClient = apiClient;
//     this.resellerReference = resellerReference;
//     this.capabilities = capabilities;
//   }

//   public validate = async () => {
//     const { result, error } = await this.apiClient.getBookings({
//       resellerReference: this.resellerReference,
//     });
//     const name = "Correct list booking by reseller reference";
//     if (error) {
//       const data = error as unknown;
//       return {
//         name,
//         success: false,
//         errors: [error.body.errorMessage as string],
//         data: data as Booking[],
//       };
//     }

//     result.map((booking) => {
//       if (booking.resellerReference !== this.resellerReference) {
//         return {
//           name,
//           success: false,
//           errors: ["Returned booking with wrong resellerReference"],
//           data: result,
//         };
//       }
//     });

//     const errors = [];
//     result.map((result) => {
//       errors.push(
//         ...new BookingValidator({
//           capabilities: this.capabilities,
//         }).validate(result)
//       );
//     });
//     if (!R.isEmpty(errors)) {
//       return {
//         name,
//         success: false,
//         errors: errors.map((error) => error.message),
//         data: result,
//       };
//     }
//     return {
//       name,
//       success: true,
//       errors: [],
//       data: result,
//     };
//   };
// }
