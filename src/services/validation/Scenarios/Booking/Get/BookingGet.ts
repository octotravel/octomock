// import * as R from "ramda";
// import { Booking, CapabilityId } from "@octocloud/types";
// import { ApiClient } from "../../../ApiClient";
// import { Scenario } from "../../Scenario";
// import { BookingValidator } from "../../../../../validators/backendValidator/Booking/BookingValidator";

// export class BookingGetScenario implements Scenario<Booking> {
//   private apiClient: ApiClient;
//   private uuid: string;
//   private capabilities: CapabilityId[];
//   constructor({
//     apiClient,
//     uuid,
//     capabilities,
//   }: {
//     apiClient: ApiClient;
//     uuid: string;
//     capabilities: CapabilityId[];
//   }) {
//     this.apiClient = apiClient;
//     this.uuid = uuid;
//     this.capabilities = capabilities;
//   }

//   public validate = async () => {
//     const { result, error } = await this.apiClient.getBooking({
//       uuid: this.uuid,
//     });
//     const name = "Correct get booking";
//     if (error) {
//       const data = error as unknown;
//       return {
//         name,
//         success: false,
//         errors: [error.body.errorMessage as string],
//         data: data as Booking,
//       };
//     }

//     const errors = new BookingValidator({
//       capabilities: this.capabilities,
//     }).validate(result);
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
