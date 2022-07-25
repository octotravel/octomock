// import * as R from "ramda";
// import {
//   BookingContactSchema,
//   BookingUnitItemSchema,
//   CapabilityId,
// } from "@octocloud/types";
// import { ApiClient } from "../../../ApiClient";
// import { Scenario } from "../../Scenario";
// import { UnprocessableEntityErrorValidator } from "../../../../../validators/backendValidator/Error/UnprocessableEntityErrorValidator";

// export class BookingConfirmationEntityErrorScenario implements Scenario<null> {
//   private apiClient: ApiClient;
//   private uuid: string;
//   private unitItems: BookingUnitItemSchema[];
//   private contact: BookingContactSchema;
//   constructor({
//     apiClient,
//     uuid,
//     unitItems,
//     contact,
//   }: {
//     apiClient: ApiClient;
//     uuid: string;
//     unitItems: BookingUnitItemSchema[];
//     contact: BookingContactSchema;
//     capabilities: CapabilityId[];
//   }) {
//     this.apiClient = apiClient;
//     this.contact = contact;
//     this.unitItems = unitItems;
//     this.uuid = uuid;
//   }

//   public validate = async () => {
//     const { result, error } = await this.apiClient.bookingConfirmation({
//       uuid: this.uuid,
//       unitItems: this.unitItems,
//       contact: this.contact,
//     });

//     const name = "Booking confirmation with less than minimum units";
//     if (result) {
//       return {
//         name,
//         success: false,
//         errors: ["Should return UNPROCESSABLE_ENTITY"],
//         data: result as null,
//       };
//     }

//     const errors = new UnprocessableEntityErrorValidator().validate(error);
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
