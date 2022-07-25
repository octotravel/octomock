// import * as R from "ramda";
// import { InvalidProductIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";
// import { ApiClient } from "../../ApiClient";
// import { Scenario, ScenarioResult } from "../../Scenario";

// export class AvailabilityProductIdErrorScenario implements Scenario<null> {
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

//     const name = `Availability with bad product id`;
//     if (result) {
//       // test case failed
//       return {
//         name,
//         success: false,
//         errors: ["Should be invalid productId error"],
//         data: result as null,
//       };
//     }

//     const errors = new InvalidProductIdErrorValidator().validate(error);
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
