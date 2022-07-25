// import * as R from "ramda";
// import { InvalidBookingUUIDErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidBookingUUIDErrorValidator";
// import { ApiClient } from "../../../ApiClient";
// import { Scenario, ScenarioResult } from "../../Scenario";

// export class BookingGetErrorScenario implements Scenario<null> {
//   private apiClient: ApiClient;
//   private uuid: string;
//   constructor({ apiClient, uuid }: { apiClient: ApiClient; uuid: string }) {
//     this.apiClient = apiClient;
//     this.uuid = uuid;
//   }

//   public validate = async (): Promise<ScenarioResult<null>> => {
//     const { result, error } = await this.apiClient.getBooking({
//       uuid: this.uuid,
//     });

//     const name = `Booking get INVALID_BOOKING_UUID`;
//     if (result) {
//       // test case failed
//       return {
//         name,
//         success: false,
//         errors: ["Should be INVALID_BOOKING_UUID"],
//         data: result as null,
//       };
//     }

//     const errors = new InvalidBookingUUIDErrorValidator().validate(error);
//     if (!R.isEmpty(errors)) {
//       return {
//         name,
//         success: false,
//         errors: [error.body.message[0]],
//         data: error as null,
//       };
//     }
//     return {
//       name,
//       success: true,
//       errors: [],
//       data: error as null,
//     };
//   };
// }
