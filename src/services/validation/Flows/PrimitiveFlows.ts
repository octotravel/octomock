import { Config } from "../config/Config";
import { Flow, FlowResult } from "./Flow";
import { SupplierFlow } from "./Supplier/SupplierFlow";
import { ProductFlow } from "./Product/ProductFlow";
import { AvailabilityCalendarFlow } from "./Availability/AvailabilityCalendarFlow";
import { AvailabilityFlow } from "./Availability/AvailabilityFlow";
import { BookingReservationFlow } from "./Booking/BookingReservationFlow";
import { BookingExtendFlow } from "./Booking/BookingExtendFlow";
import { BookingConfirmationFlow } from "./Booking/BookingConfirmationFlow";
import { BookingUpdateFlow } from "./Booking/BookingUpdateFlow";
import { BookingCancellationFlow } from "./Booking/BookingCancellationFlow";
import { BookingGetFlow } from "./Booking/BookingGetFlow";
import { BookingListFlow } from "./Booking/BookingListFlow";

export class PrimiteFlows {
  private config = Config.getInstance();

  public validate = async (): Promise<FlowResult[]> => {
    const flows: Flow[] = [
      new SupplierFlow(),
      new ProductFlow(),
      new AvailabilityCalendarFlow(),
      new AvailabilityFlow(),
      new BookingReservationFlow(),
      new BookingExtendFlow(),
      new BookingConfirmationFlow(),
      new BookingUpdateFlow(),
      new BookingCancellationFlow(),
      new BookingGetFlow(),
      new BookingListFlow(),
    ];

    const results = [];
    for await (const flow of flows) {
      const result = await flow.validate();
      results.push(result);
      if (this.config.terminateValidation) {
        break;
      }
    }

    return results;
  };
}
