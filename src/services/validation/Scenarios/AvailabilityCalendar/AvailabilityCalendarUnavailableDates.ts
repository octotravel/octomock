import * as R from "ramda";
import {
  AvailabilityCalendar,
  AvailabilityStatus,
  AvailabilityUnit,
  CapabilityId,
} from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../Scenario";
import { AvailabilityCalendarValidator } from "../../../../validators/backendValidator/AvailabilityCalendar/AvailabilityCalendarValidator";

export class AvailabilityCalendarUnavailableDatesScenario
  implements Scenario<AvailabilityCalendar[]>
{
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDateStart: string;
  private localDateEnd: string;
  private units: AvailabilityUnit[];
  private availabilityType: string;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    productId,
    optionId,
    localDateStart,
    localDateEnd,
    units,
    availabilityType,
    capabilities,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDateStart: string;
    localDateEnd: string;
    units?: AvailabilityUnit[];
    availabilityType: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDateStart = localDateStart;
    this.localDateEnd = localDateEnd;
    this.units = units;
    this.availabilityType = availabilityType;
    this.capabilities = capabilities;
  }

  public validate = async () => {
    const { request, response } = await this.apiClient.getAvailabilityCalendar({
      productId: this.productId,
      optionId: this.optionId,
      localDateStart: this.localDateStart,
      localDateEnd: this.localDateEnd,
      units: this.units,
    });
    const name = `Availability Calendar Interval (${this.availabilityType})`;
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

    if (!R.isEmpty(response.data.body)) {
      if (
        response.data.body
          .map((availability) => {
            return (
              availability.status === AvailabilityStatus.CLOSED ||
              (availability.status === AvailabilityStatus.SOLD_OUT &&
                !availability.available)
            );
          })
          .some((status) => !status)
      ) {
        return {
          name,
          success: false,
          request,
          response: {
            body: response.data.body as null,
            status: response.data.status,
            error: null,
          },
          errors: [
            "Availability should be empty or SOLD_OUT/CLOSED and not available",
          ],
        };
      }
    }

    const errors = [];
    response.data.body.map((result) => {
      errors.push(
        ...new AvailabilityCalendarValidator({
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
