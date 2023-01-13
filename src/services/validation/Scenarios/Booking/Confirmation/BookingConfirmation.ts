import { Booking, CapabilityId } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { BookingConfirmationScenarioHelper } from "../../../helpers/BookingConfirmationScenarioHelper";
import { Config } from "../../../config/Config";
import descriptions from "../../../consts/descriptions";

export class BookingConfirmationScenario implements Scenario<Booking> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private booking: Booking;
  private capabilities: CapabilityId[];
  constructor({ booking, capabilities }: { booking: Booking; capabilities: CapabilityId[] }) {
    this.booking = booking;
    this.capabilities = capabilities;
  }
  private bookingConfirmationScenarioHelper = new BookingConfirmationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingConfirmation({
      uuid: this.booking.uuid,
      contact: {
        firstName: "John",
        lastName: "Doe",
        emailAddress: "johndoe@mail.com",
        fullName: "John Doe",
        notes: "Test note",
      },
      resellerReference: "RESELLERREF#1",
    });
    const name = `Booking Confirmation`;
    const description = descriptions.bookingConfirmation;

    return this.bookingConfirmationScenarioHelper.validateBookingConfirmation(
      {
        result,
        name,
        description,
      },
      {
        capabilities: this.capabilities,
      },
      this.booking
    );
  };
}
