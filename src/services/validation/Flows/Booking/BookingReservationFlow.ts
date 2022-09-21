import { BookingReservationScenario } from "../../Scenarios/Booking/Reservation/BookingReservationScenario";
import { Flow, FlowResult } from "../Flow";
import { BookingReservationInvalidProductScenario } from "../../Scenarios/Booking/Reservation/BookingReservationInvalidProductScenario";
import { BookingReservationInvalidOptionScenario } from "../../Scenarios/Booking/Reservation/BookingReservationInvalidOptionScenario";
import { BookingReservationInvalidAvailabilityIdScenario } from "../../Scenarios/Booking/Reservation/BookingReservationInvalidAvailabilityIdScenario";
import { BaseFlow } from "../BaseFlow";
import { BookingReservationSoldOutScenario } from "../../Scenarios/Booking/Reservation/BookingReservationSoldOutScenario";
import { BookingReservationMissingUnitItemsScenario } from "../../Scenarios/Booking/Reservation/BookingReservationMissingUnitItemsScenario";
import { BookingReservationEmptyUnitItemsScenario } from "../../Scenarios/Booking/Reservation/BookingReservationEmptyUnitItemsScenario";
import { BookingReservationInvalidUnitIdScenario } from "../../Scenarios/Booking/Reservation/BookingReservationInvalidUnitIdScenario";
import { Scenario } from "../../Scenarios/Scenario";
import { Booker } from "../../Booker";
import docs from "../../consts/docs";

export class BookingReservationFlow extends BaseFlow implements Flow {
  private booker = new Booker();
  constructor() {
    super("Booking Reservation", docs.bookingReservation);
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios = [
      await this.reserveAvailableProduct(),
      await this.reserveSoldOutProduct(),
      await this.reserveInvalidProduct(),
      await this.reserveInvalidOption(),
      await this.reserveInvalidAvailabilityID(),
      await this.reserveWithMissingUnitItems(),
      await this.reserveWithEmptyUnitItems(),
      await this.validateBookingInvalidUnitId(),
    ];
    return this.validateScenarios(scenarios);
  };

  private reserveAvailableProduct = async (): Promise<Scenario<unknown>> => {
    const [bookableProduct] = this.config.productConfig.availableProducts;

    const result = await this.booker.createReservation(bookableProduct);
    return new BookingReservationScenario({ result });
  };

  private reserveSoldOutProduct = async (): Promise<Scenario<unknown>> => {
    const bookableProduct = this.config.productConfig.soldOutProduct;

    const result = await this.booker.createReservation(bookableProduct, {
      soldOutAvailability: true,
    });
    return new BookingReservationSoldOutScenario({ result });
  };

  private reserveInvalidProduct = async (): Promise<Scenario<unknown>> => {
    const [bookableProduct] = this.config.productConfig.availableProducts;

    const result = await this.booker.createReservation(bookableProduct, {
      invalidProductId: true,
    });
    return new BookingReservationInvalidProductScenario({ result });
  };

  private reserveInvalidOption = async (): Promise<Scenario<unknown>> => {
    const [bookableProduct] = this.config.productConfig.availableProducts;

    const result = await this.booker.createReservation(bookableProduct, {
      invalidOptionId: true,
    });
    return new BookingReservationInvalidOptionScenario({
      result,
    });
  };

  private reserveInvalidAvailabilityID = async (): Promise<
    Scenario<unknown>
  > => {
    const [bookableProduct] = this.config.productConfig.availableProducts;

    const result = await this.booker.createReservation(bookableProduct, {
      invalidAvailabilityId: true,
    });
    return new BookingReservationInvalidAvailabilityIdScenario({
      result,
    });
  };

  private reserveWithMissingUnitItems = async (): Promise<
    Scenario<unknown>
  > => {
    const [bookableProduct] = this.config.productConfig.availableProducts;

    const result = await this.booker.createReservation(bookableProduct, {
      unitItemsMissing: true,
    });
    return new BookingReservationMissingUnitItemsScenario({
      result,
    });
  };

  private reserveWithEmptyUnitItems = async (): Promise<Scenario<unknown>> => {
    const [bookableProduct] = this.config.productConfig.availableProducts;

    const result = await this.booker.createReservation(bookableProduct, {
      unitItemsEmpty: true,
    });
    return new BookingReservationEmptyUnitItemsScenario({ result });
  };

  private validateBookingInvalidUnitId = async (): Promise<
    Scenario<unknown>
  > => {
    const [bookableProduct] = this.config.productConfig.availableProducts;

    const result = await this.booker.createReservation(bookableProduct, {
      invalidUnitItems: true,
    });

    return new BookingReservationInvalidUnitIdScenario({
      result,
    });
  };
}
