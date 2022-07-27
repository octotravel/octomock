import * as R from "ramda";
import {
  Availability,
  AvailabilityStatus,
  CapabilityId,
} from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../Scenario";
import { AvailabilityValidator } from "../../../../validators/backendValidator/Availability/AvailabilityValidator";

export class AvailabilityCheckDateScenario implements Scenario<Availability[]> {
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDate: string;
  private availabilityType: string;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    productId,
    optionId,
    localDate,
    availabilityType,
    capabilities,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDate: string;
    availabilityType: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDate = localDate;
    this.availabilityType = availabilityType;
    this.capabilities = capabilities;
  }

  public validate = async () => {
    const { request, response } = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      localDate: this.localDate,
    });
    const name = `Availability Check Date (${this.availabilityType})`;
    if (response.error) {
      return {
        name,
        success: false,
        request,
        response: {
          body: null,
          status: response.error.status,
          error: {
            body: response.error.body,
          },
        },
        errors: [],
      };
    }

    if (R.isEmpty(response.data.body)) {
      return {
        name,
        success: false,
        request,
        response: {
          body: response.data.body,
          status: response.data.status,
          error: null,
        },
        errors: ["Availability has to be available"],
      };
    }

    if (
      response.data.body
        .map((availability) => {
          return (
            !availability.available ||
            availability.status === AvailabilityStatus.CLOSED ||
            availability.status === AvailabilityStatus.SOLD_OUT
          );
        })
        .some((status) => status)
    ) {
      return {
        name,
        success: false,
        request,
        response: {
          body: response.data.body,
          status: response.data.status,
          error: null,
        },
        errors: ["Availability can not be SOLD_OUT or CLOSED or not available"],
      };
    }

    const errors = [];
    response.data.body.map((result) => {
      errors.push(
        ...new AvailabilityValidator({
          capabilities: this.capabilities,
        }).validate(result)
      );
    });
    if (!R.isEmpty(errors)) {
      return {
        name,
        success: false,
        request,
        response: {
          body: response.data.body,
          status: response.data.status,
          error: null,
        },
        errors: errors.map((error) => error.message),
      };
    }
    return {
      name,
      success: true,
      request,
      response: {
        body: response.data.body,
        status: response.data.status,
        error: null,
      },
      errors: [],
    };
  };
}
