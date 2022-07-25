// import * as R from "ramda";
// import {
//   AvailabilityCalendar,
//   AvailabilityUnit,
//   CapabilityId,
// } from "@octocloud/types";
// import { ApiClient } from "../../ApiClient";
// import { Scenario } from "../Scenario";
// import { AvailabilityCalendarValidator } from "../../../../validators/backendValidator/AvailabilityCalendar/AvailabilityCalendarValidator";

// export class AvailabilityCalendarScenario
//   implements Scenario<AvailabilityCalendar[]>
// {
//   private apiClient: ApiClient;
//   private productId: string;
//   private optionId: string;
//   private localDateStart: string;
//   private localDateEnd: string;
//   private units: AvailabilityUnit[];
//   private capabilities: CapabilityId[];
//   constructor({
//     apiClient,
//     productId,
//     optionId,
//     localDateStart,
//     localDateEnd,
//     units,
//     capabilities,
//   }: {
//     apiClient: ApiClient;
//     productId: string;
//     optionId: string;
//     localDateStart: string;
//     localDateEnd: string;
//     units?: AvailabilityUnit[];
//     capabilities: CapabilityId[];
//   }) {
//     this.apiClient = apiClient;
//     this.productId = productId;
//     this.optionId = optionId;
//     this.localDateStart = localDateStart;
//     this.localDateEnd = localDateEnd;
//     this.units = units;
//     this.capabilities = capabilities;
//   }

//   public validate = async () => {
//     const { result, error } = await this.apiClient.getAvailabilityCalendar({
//       productId: this.productId,
//       optionId: this.optionId,
//       localDateStart: this.localDateStart,
//       localDateEnd: this.localDateEnd,
//       units: this.units,
//     });
//     const name = "Correct availability";
//     if (error) {
//       const data = error as unknown;
//       return {
//         name,
//         success: false,
//         errors: [error.body.errorMessage as string],
//         data: data as AvailabilityCalendar[],
//       };
//     }
//     const errors = [];
//     result.map((result) => {
//       errors.push(
//         ...new AvailabilityCalendarValidator({
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
