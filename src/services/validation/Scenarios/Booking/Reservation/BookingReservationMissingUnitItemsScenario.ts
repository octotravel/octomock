import { CreateBookingBodySchema } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { UnprocessableEntityErrorValidator } from "../../../../../validators/backendValidator/Error/UnprocessableEntityErrorValidator";
import { BookingReservationScenarioHelper } from "../../../helpers/BookingReservationScenarioHelper";
import { Config } from "../../../config/Config";

export class BookingReservationMissingUnitItemsScenario
  implements Scenario<any>
{
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private productId: string;
  private optionId: string;
  private availabilityId: string;
  constructor({
    productId,
    optionId,
    availabilityId,
  }: {
    productId: string;
    optionId: string;
    availabilityId: string;
  }) {
    this.productId = productId;
    this.optionId = optionId;
    this.availabilityId = availabilityId;
  }
  private bookingReservationScenarioHelper =
    new BookingReservationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingReservation({
      productId: this.productId,
      optionId: this.optionId,
      availabilityId: this.availabilityId,
    } as CreateBookingBodySchema);

    const name =
      "Booking Reservation Missing UnitItems (400 UNPROCESSABLE_ENTITY)";
    const error = "Response should be UNPROCESSABLE_ENTITY";

    return this.bookingReservationScenarioHelper.validateError(
      {
        result,
        name,
      },
      error,
      new UnprocessableEntityErrorValidator()
    );
  };
}
