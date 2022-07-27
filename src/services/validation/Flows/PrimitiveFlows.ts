import { Config } from "../config/Config";
import { Flow } from "./Flow";
import { SupplierFlow } from "./Supplier/SupplierFlow";
import { ProductFlow } from "./Product/ProductFlow";
import { AvailabilityFlow } from "./Availability/AvailabilityFlow";
import { AvailabilityCalendarFlow } from "./Availability/AvailabilityCalendarFlow";
// import { BookingCancellationFlow } from "./Booking/BookingCancellationFlow";
// import { BookingConfirmationFlow } from "./Booking/BookingConfirmationFlow";
// import { BookingGetFlow } from "./Booking/BookingGetFlow";
// import { BookingListFlow } from "./Booking/BookingListFlow";
// import { BookingReservationFlow } from "./Booking/BookingReservationFlow";

export class PrimiteFlows {
  private config: Config;
  constructor({ config }: { config: Config }) {
    this.config = config;
  }
  public validate = async (): Promise<Flow[]> => {
    const config = this.config;
    const flows = [];

    const supplierFlow = await new SupplierFlow({ config }).validate();
    flows.push(supplierFlow);
    if (!supplierFlow.success) return flows;

    const productFlow = await new ProductFlow({ config }).validate();
    flows.push(productFlow);
    if (!productFlow.success) return flows;

    const availabilityFlow = await new AvailabilityFlow({ config }).validate();
    flows.push(availabilityFlow);
    if (!availabilityFlow.success) return flows;

    const availabilityCalendarFlow = await new AvailabilityCalendarFlow({
      config,
    }).validate();
    flows.push(availabilityCalendarFlow);
    if (!availabilityCalendarFlow.success) return flows;

    // const bookingReservationFlow = await new BookingReservationFlow({
    //   config,
    // }).validate();
    // const bookingConfirmation = await new BookingConfirmationFlow({
    //   config,
    // }).validate();
    // const bookingListFlow = await new BookingListFlow({ config }).validate();
    // const bookingGetFlow = await new BookingGetFlow({ config }).validate();
    // const bookingCancellationFlow = await new BookingCancellationFlow({
    //   config,
    // }).validate();
    return [
      supplierFlow,
      productFlow,
      availabilityFlow,
      availabilityCalendarFlow,
      // bookingReservationFlow,
      // bookingConfirmation,
      // bookingListFlow,
      // bookingGetFlow,
      // bookingCancellationFlow,
    ];
  };
}
