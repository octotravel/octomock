// import * as R from "ramda";
// import { InvalidOptionIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidOptionIdErrorValidator";
// import { ApiClient } from "../../ApiClient";
// import { Scenario, ScenarioResult } from "../Scenario";

// export class AvailabilityOptionIdErrorScenario implements Scenario<null> {
//   private apiClient: ApiClient;
//   private productId: string;
//   private optionId: string;
//   private localDate: string;
//   constructor({
//     apiClient,
//     productId,
//     optionId,
//     localDate,
//   }: {
//     apiClient: ApiClient;
//     productId: string;
//     optionId: string;
//     localDate: string;
//   }) {
//     this.apiClient = apiClient;
//     this.productId = productId;
//     this.optionId = optionId;
//     this.localDate = localDate;
//   }

//   public validate = async (): Promise<ScenarioResult<null>> => {
//     const { result, error } = await this.apiClient.getAvailability({
//       productId: this.productId,
//       optionId: this.optionId,
//       localDate: this.localDate,
//     });
//     const name = `Availability with bad option id`;
//     if (result) {
//       // test case failed
//       return {
//         name,
//         success: false,
//         errors: ["Should be invalid optionId error"],
//         data: result as null,
//       };
//     }

//     const errors = new InvalidOptionIdErrorValidator().validate(error);
//     if (!R.isEmpty(errors)) {
//       return {
//         name,
//         success: false,
//         errors: errors.map((error) => error.message),
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
