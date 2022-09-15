import { InvalidAvailabilityIdErrorValidator } from "./../../../../../validators/backendValidator/Error/InvalidAvailabilityIdErrorValidator";
import { BookingUnitItemSchema } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { BookingReservationScenarioHelper } from "../../../helpers/BookingReservationScenarioHelper";
import { Config } from "../../../config/Config";

export class BookingReservationInvalidAvailabilityIdScenario
  implements Scenario<any>
{
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private productId: string;
  private optionId: string;
  private availabilityId: string;
  private unitItems: BookingUnitItemSchema[];
  constructor({
    productId,
    optionId,
    availabilityId,
    unitItems,
  }: {
    productId: string;
    optionId: string;
    availabilityId: string;
    unitItems: BookingUnitItemSchema[];
  }) {
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

    return this.bookingReservationScenarioHelper.validateError(
      {
        result,
        name,
      },
      error,
      new InvalidAvailabilityIdErrorValidator()
    );
  };
}
