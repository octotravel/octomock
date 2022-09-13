import { BookingUnitItemSchema, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../api/ApiClient";
import { Scenario } from "../../Scenario";
import { UnprocessableEntityErrorValidator } from "../../../../../validators/backendValidator/Error/UnprocessableEntityErrorValidator";
import { BookingReservationScenarioHelper } from "../../../helpers/BookingReservationScenarioHelper";

export class BookingReservationMissingUnitItemsScenario
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
      "Booking Reservation Missing UnitItems (400 UNPROCESSABLE_ENTITY)";
    const error = "Response should be UNPROCESSABLE_ENTITY";

    return this.bookingReservationScenarioHelper.validateBookingReservationError(
      {
        ...result,
        name,
      },
      error,
      new UnprocessableEntityErrorValidator()
    );
  };
}
