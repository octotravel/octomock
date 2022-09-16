import { Flow, FlowResult } from "../Flow";
import { BookingListSupplierReferenceScenario } from "../../Scenarios/Booking/List/BookingListSupplierReference";
import { BookingListResellerReferenceScenario } from "../../Scenarios/Booking/List/BookingListResellerReference";
import { BookingListBadRequestScenario } from "../../Scenarios/Booking/List/BookingListBadRequest";
import { DateHelper } from "../../../../helpers/DateHelper";
import { BaseFlow } from "../BaseFlow";
import { Booker } from "../../Booker";

export class BookingListFlow extends BaseFlow implements Flow {
  private apiClient = this.config.getApiClient();
  private booker = new Booker();
  constructor() {
    super("List Bookings");
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios = [
      await this.validateListBookingsSupplierReference(),
      await this.validateListBookingsResellerReference(),
      await this.validateListBookingBadRequestError(),
    ];
    return this.validateScenarios(scenarios);
  };

  private validateListBookingsSupplierReference =
    async (): Promise<BookingListSupplierReferenceScenario> => {
      const [bookableProduct] = this.config.productConfig.availableProducts;

      const reservationResult = await this.booker.createReservation(
        bookableProduct
      );
      const reservation = reservationResult.data;

      const result = await this.apiClient.bookingConfirmation({
        uuid: reservation.id,
        contact: {
          fullName: "John Doe",
        },
      });
      const booking = result.data;
      return new BookingListSupplierReferenceScenario({
        supplierReference: booking.supplierReference,
        capabilities: this.config.getCapabilityIDs(),
      });
    };

  private validateListBookingsResellerReference =
    async (): Promise<BookingListResellerReferenceScenario> => {
      const [bookableProduct] = this.config.productConfig.availableProducts;

      const reservationResult = await this.booker.createReservation(
        bookableProduct
      );
      const reservation = reservationResult.data;

      const resellerReference = `TEST_REFERENCE-${DateHelper.getDate(
        new Date().toISOString()
      )}`;
      await this.apiClient.bookingConfirmation({
        uuid: reservation.id,
        contact: {
          fullName: "John Doe",
        },
        resellerReference,
      });
      return new BookingListResellerReferenceScenario({
        resellerReference,
        capabilities: this.config.getCapabilityIDs(),
      });
    };

  private validateListBookingBadRequestError =
    async (): Promise<BookingListBadRequestScenario> => {
      return new BookingListBadRequestScenario();
    };
}
