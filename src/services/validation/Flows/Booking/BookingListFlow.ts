import { BookingUnitItemSchema, UnitType } from "@octocloud/types";
import { Flow, FlowResult } from "../Flow";
import { BookingListSupplierReferenceScenario } from "../../Scenarios/Booking/List/BookingListSupplierReference";
import { BookingListResellerReferenceScenario } from "../../Scenarios/Booking/List/BookingListResellerReference";
import { BookingListBadRequestScenario } from "../../Scenarios/Booking/List/BookingListBadRequest";
import { DateHelper } from "../../../../helpers/DateHelper";
import { BaseFlow } from "../BaseFlow";

export class BookingListFlow extends BaseFlow implements Flow {
  private apiClient = this.config.getApiClient();
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
      const product = this.config.getProduct();
      // TODO: get from somewhere else
      const option = product.options[0];

      const unitAdult =
        option.units.find((u) => u.type === UnitType.ADULT) ?? null;
      if (unitAdult === null) {
        throw Error("no adult unit");
      }

      const unitItems: BookingUnitItemSchema[] = [
        { unitId: unitAdult.id },
        { unitId: unitAdult.id },
      ];
      const reservationResult = await this.apiClient.bookingReservation({
        productId: product.id,
        optionId: option.id,
        availabilityId: "2022-10-14T00:00:00-04:00",
        unitItems,
      });
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
      const product = this.config.getProduct();
      // TODO: get from somewhere else
      const option = product.options[0];

      const unitAdult =
        option.units.find((u) => u.type === UnitType.ADULT) ?? null;
      if (unitAdult === null) {
        throw Error("no adult unit");
      }

      const unitItems: BookingUnitItemSchema[] = [
        { unitId: unitAdult.id },
        { unitId: unitAdult.id },
      ];
      const reservationResult = await this.apiClient.bookingReservation({
        productId: product.id,
        optionId: option.id,
        availabilityId: "2022-10-14T00:00:00-04:00",
        unitItems,
      });
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
