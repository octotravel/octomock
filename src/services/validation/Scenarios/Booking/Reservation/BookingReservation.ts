import { Booking, BookingUnitItemSchema, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../ApiClient";
import { Scenario } from "../../Scenario";
import { BookingReservationScenarioHelper } from "../../../helpers/BookingReservationScenarioHelper";

export class BookingReservationScenario implements Scenario<Booking> {
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private availabilityId: string;
  private unitItems: BookingUnitItemSchema[];
  private availabilityType: string;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    productId,
    optionId,
    availabilityId,
    unitItems,
    availabilityType,
    capabilities,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    availabilityId: string;
    unitItems: BookingUnitItemSchema[];
    availabilityType: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.availabilityId = availabilityId;
    this.unitItems = unitItems;
    this.availabilityType = availabilityType;
    this.capabilities = capabilities;
  }
  private bookingReservationScenarioHelper =
    new BookingReservationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingReservation({
      productId: this.productId,
      optionId: this.optionId,
      availabilityId: this.availabilityId,
      unitItems: this.unitItems,
    });
    const name = `Booking Reservation (${this.availabilityType})`;

    return this.bookingReservationScenarioHelper.validateBookingReservation(
      {
        ...result,
        name,
      },
      this.capabilities
    );
    // if (response.error) {
    //   const data = error as unknown;
    //   return {
    //     name,
    //     success: false,
    //     errors: [error.body.errorMessage as string],
    //     data: data as Booking,
    //   };
    // }

    // const errors = new BookingValidator({
    //   capabilities: this.capabilities,
    // }).validate(result);
    // if (!R.isEmpty(errors)) {
    //   return {
    //     name,
    //     success: false,
    //     errors: errors.map((error) => error.message),
    //     data: result,
    //   };
    // }
    // return {
    //   name,
    //   success: true,
    //   errors: [],
    //   data: result,
    // };
  };
}
