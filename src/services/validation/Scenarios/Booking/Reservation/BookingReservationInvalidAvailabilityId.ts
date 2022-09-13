import { BookingUnitItemSchema, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../api/ApiClient";
import { Scenario } from "../../Scenario";
import { InvalidAvailabilityIdErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidAvailabilityIdErrorValidator";
import { BookingReservationScenarioHelper } from "../../../helpers/BookingReservationScenarioHelper";

export class BookingReservationInvalidAvailabilityIdScenario
  implements Scenario<null>
{
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private availabilityId: string;
  private unitItems: BookingUnitItemSchema[];
  constructor({
    apiClient,
    productId,
    optionId,
    availabilityId,
    unitItems,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    availabilityId: string;
    unitItems: BookingUnitItemSchema[];
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.availabilityId = availabilityId;
    this.unitItems = unitItems;
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

    const name =
      "Booking Reservation Invalid Availability ID (400 INVALID_AVAILABILITY_ID)";
    const error = "Response should be INVALID_AVAILABILITY_ID";

    return this.bookingReservationScenarioHelper.validateBookingReservationError(
      {
        ...result,
        name,
      },
      error,
      new InvalidAvailabilityIdErrorValidator()
    );
  };
}
