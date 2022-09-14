import { Config } from "../config/Config";
import { Flow, FlowResult } from "./Flow";
import { SupplierFlow } from "./Supplier/SupplierFlow";
import { ProductFlow } from "./Product/ProductFlow";
import { AvailabilityFlow } from "./Availability/AvailabilityFlow";
import { AvailabilityCalendarFlow } from "./Availability/AvailabilityCalendarFlow";
import { BookingReservationFlow } from "./Booking/BookingReservationFlow";
// import { BookingExtendFlow } from "./Booking/BookingExtendFlow";
// import { BookingConfirmationFlow } from "./Booking/BookingConfirmationFlow";
// import { BookingUpdateFlow } from "./Booking/BookingUpdateFlow";
// import { BookingCancellationFlow } from "./Booking/BookingCancellationFlow";
// import { BookingGetFlow } from "./Booking/BookingGetFlow";
// import { BookingListFlow } from "./Booking/BookingListFlow";

export class PrimiteFlows {
  private config = Config.getInstance();

  public validate = async (): Promise<FlowResult[]> => {
    const flows: Flow[] = [
      new SupplierFlow(),
      new ProductFlow(),
      new AvailabilityFlow(),
      new AvailabilityCalendarFlow(),
      new BookingReservationFlow(),
      // new BookingExtendFlow({ config }),
      // new BookingConfirmationFlow({ config }),
      // new BookingUpdateFlow({ config }),
      // new BookingCancellationFlow({ config }),
      // new BookingGetFlow({ config }),
      // new BookingListFlow({ config }),
    ];

    const results = [];
    for await (const flow of flows) {
      const result = await flow.validate();
      results.push(result);
      if (!result.success && !this.config.ignoreKill) {
        break;
      }
    }

    return results;
  };
}
