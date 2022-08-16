import { Config } from "../config/Config";
import { Flow, FlowResult } from "./Flow";
import { SupplierFlow } from "./Supplier/SupplierFlow";
import { ProductFlow } from "./Product/ProductFlow";
import { AvailabilityFlow } from "./Availability/AvailabilityFlow";
import { AvailabilityCalendarFlow } from "./Availability/AvailabilityCalendarFlow";
import { BookingReservationFlow } from "./Booking/BookingReservationFlow";
import { BookingExtendFlow } from "./Booking/BookingExtendFlow";
import { BookingConfirmationFlow } from "./Booking/BookingConfirmationFlow";

export class PrimiteFlows {
  private config: Config;
  constructor({ config }: { config: Config }) {
    this.config = config;
  }
  public validate = async (): Promise<FlowResult[]> => {
    const config = this.config;
    const flows: Flow[] = [
      new SupplierFlow({ config }),
      new ProductFlow({ config }),
      new AvailabilityFlow({ config }),
      new AvailabilityCalendarFlow({ config }),
      new BookingReservationFlow({ config }),
      new BookingExtendFlow({ config }),
      new BookingConfirmationFlow({ config }),
    ];
    const results = [];
    for await (const flow of flows) {
      const result = await flow.validate();
      results.push(result);
      if (!result.success) {
        break;
      }
    }
    return results;
  };
}
