import * as R from "ramda";
import { Booking, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../ApiClient";
import { Scenario } from "../../../Scenario";
import { BookingValidator } from "../../../../../validators/backendValidator/Booking/BookingValidator";

export class BookingListSupplierScenario implements Scenario<Booking[]> {
  private apiClient: ApiClient;
  private supplierReference: string;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    supplierReference,
    capabilities,
  }: {
    apiClient: ApiClient;
    supplierReference: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.supplierReference = supplierReference;
    this.capabilities = capabilities;
  }

  public validate = async () => {
    const { result, error } = await this.apiClient.getBookings({
      supplierReference: this.supplierReference,
    });
    const name = "Correct list booking by supplier reference";
    if (error) {
      const data = error as unknown;
      return {
        name,
        success: false,
        errors: [error.body.errorMessage as string],
        data: data as Booking[],
      };
    }

    if (
      result.some(
        (booking) => booking.supplierReference !== this.supplierReference
      )
    ) {
      return {
        name,
        success: false,
        errors: [`SupplierReference should be ${this.supplierReference}`],
        data: result,
      };
    }

    const errors = [];
    result.map((result) => {
      errors.push(
        ...new BookingValidator({
          capabilities: this.capabilities,
        }).validate(result)
      );
    });
    if (!R.isEmpty(errors)) {
      return {
        name,
        success: false,
        errors: errors.map((error) => error.message),
        data: result,
      };
    }
    return {
      name,
      success: true,
      errors: [],
      data: result,
    };
  };
}
