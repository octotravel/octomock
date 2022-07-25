// import * as R from "ramda";
// import { BadRequestErrorValidator } from "../../../../../validators/backendValidator/Error/BadRequestErrorValidator";
// import { ApiClient } from "../../../ApiClient";
// import { Scenario, ScenarioResult } from "../../Scenario";

// export class BookingListErrorScenario implements Scenario<null> {
//   private apiClient: ApiClient;
//   constructor({ apiClient }: { apiClient: ApiClient }) {
//     this.apiClient = apiClient;
//   }

//   public validate = async (): Promise<ScenarioResult<null>> => {
//     const { result, error } = await this.apiClient.getBookings({});

//     const name = `Booking list bad request`;
//     if (result) {
//       // test case failed
//       return {
//         name,
//         success: false,
//         errors: ["Should be bad request error"],
//         data: result as null,
//       };
//     }

//     const errors = new BadRequestErrorValidator().validate(error);
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
