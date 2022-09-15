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
import { ErrorScenario } from "../../Scenarios/ErrorScenario";

export class BookingReservationFlow extends BaseFlow implements Flow {
  constructor() {
    super("Booking Reservation");
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
    const { data, error } = this.config.getBookingProduct();
    const product = data;
    if (data === null) {
      return new ErrorScenario([error]);
    }

    const bookingData = {
      productId: product.product.id,
      optionId: product.getOption().id,
      availabilityId: product.getAvailabilityIDAvailable()[0],
      unitItems: product.getValidUnitItems(),
      notes: "Test note",
    };
    return new BookingReservationScenario(bookingData);
  };

  private reserveSoldOutProduct = async (): Promise<Scenario<unknown>> => {
    const { data, error } = this.config.getBookingProduct();
    const product = data;
    if (data === null) {
      throw error;
    }

    const bookingData = {
      productId: product.product.id,
      optionId: product.getOption().id,
      availabilityId: product.getAvailabilityIDSoldOut(),
      unitItems: product.getValidUnitItems(),
      notes: "Test note",
    };
    return new BookingReservationSoldOutScenario(bookingData);
  };

  private reserveInvalidProduct = async (): Promise<Scenario<unknown>> => {
    const { data, error } = this.config.getBookingProduct();
    const product = data;
    if (data === null) {
      throw error;
    }
    return new BookingReservationInvalidProductScenario({
      productId: this.config.invalidProductId,
      optionId: product.getOption().id,
      availabilityId: product.getAvailabilityIDAvailable()[0],
      unitItems: product.getValidUnitItems(),
    });
  };

  private reserveInvalidOption = async (): Promise<Scenario<unknown>> => {
    const { data, error } = this.config.getBookingProduct();
    const product = data;
    if (data === null) {
      throw error;
    }
    return new BookingReservationInvalidOptionScenario({
      productId: product.product.id,
      optionId: this.config.invalidOptionId,
      availabilityId: product.getAvailabilityIDAvailable()[0],
      unitItems: product.getValidUnitItems(),
    });
  };

  private reserveInvalidAvailabilityID = async (): Promise<
    Scenario<unknown>
  > => {
    const { data, error } = this.config.getBookingProduct();
    const product = data;
    if (data === null) {
      throw error;
    }
    return new BookingReservationInvalidAvailabilityIdScenario({
      productId: product.product.id,
      optionId: product.getOption().id,
      availabilityId: "invalidAvailabilityId",
      unitItems: product.getValidUnitItems(),
    });
  };

  private reserveWithMissingUnitItems = async (): Promise<
    Scenario<unknown>
  > => {
    const { data, error } = this.config.getBookingProduct();
    const product = data;
    if (data === null) {
      throw error;
    }
    return new BookingReservationMissingUnitItemsScenario({
      productId: product.product.id,
      optionId: product.getOption().id,
      availabilityId: product.getAvailabilityIDAvailable()[0],
    });
  };

  private reserveWithEmptyUnitItems = async (): Promise<Scenario<unknown>> => {
    const { data, error } = this.config.getBookingProduct();
    const product = data;
    if (data === null) {
      throw error;
    }
    const bookingData = {
      productId: product.product.id,
      optionId: product.getOption().id,
      availabilityId: product.getAvailabilityIDAvailable()[0],
      unitItems: [],
    };
    return new BookingReservationEmptyUnitItemsScenario(bookingData);
  };

  private validateBookingInvalidUnitId = async (): Promise<
    Scenario<unknown>
  > => {
    const { data, error } = this.config.getBookingProduct();
    const product = data;
    if (data === null) {
      throw error;
    }

    return new BookingReservationInvalidUnitIdScenario({
      productId: product.product.id,
      optionId: product.getOption().id,
      availabilityId: product.getAvailabilityIDAvailable()[0],
      unitItems: product.getInvalidUnitItems({ quantity: 3 }),
    });
  };
}
