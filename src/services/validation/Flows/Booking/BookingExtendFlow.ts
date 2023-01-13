import { Flow, FlowResult } from "../Flow";
import { BookingReservationExtendScenario } from "../../Scenarios/Booking/Extend/BookingReservationExtend";
import { BookingReservationExtendInvalidUUIDScenario } from "../../Scenarios/Booking/Extend/BookingReservationExtendInvalidUUID";
import { BaseFlow } from "../BaseFlow";
import { Booker } from "../../Booker";
import docs from "../../consts/docs";

export class BookingExtendFlow extends BaseFlow implements Flow {
  private booker = new Booker();
  constructor() {
    super("Extend Reservation", docs.bookingReservationExtend);
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios = [await this.extendBooking(), await this.extendBookingWithInvalidUUID()];
    return this.validateScenarios(scenarios);
  };

  private extendBooking = async (): Promise<BookingReservationExtendScenario> => {
    const [bookableProduct] = this.config.productConfig.availableProducts;

    const result = await this.booker.createReservation(bookableProduct);
    const booking = result.data;
    return new BookingReservationExtendScenario({
      capabilities: this.config.getCapabilityIDs(),
      booking,
    });
  };

  private extendBookingWithInvalidUUID =
    async (): Promise<BookingReservationExtendInvalidUUIDScenario> => {
      return new BookingReservationExtendInvalidUUIDScenario({
        uuid: this.config.invalidUUID,
      });
    };
}
