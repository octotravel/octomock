import { AvailabilityStatus } from "@octocloud/types";
import * as R from "ramda";
import { ApiClient } from "../../ApiClient";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCheckUnavailableDatesScenario
  implements Scenario<null>
{
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDateStart: string;
  private localDateEnd: string;
  private availabilityType: string;
  constructor({
    apiClient,
    productId,
    optionId,
    localDateStart,
    localDateEnd,
    availabilityType,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDateStart: string;
    localDateEnd: string;
    availabilityType: string;
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDateStart = localDateStart;
    this.localDateEnd = localDateEnd;
    this.availabilityType = availabilityType;
  }

  public validate = async (): Promise<ScenarioResult<null>> => {
    const { request, response } = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      localDateStart: this.localDateStart,
      localDateEnd: this.localDateEnd,
    });
    const name = `Availability Check Unavailable Dates (${this.availabilityType})`;
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
    return {
      name,
      success: true,
      request,
      response: {
        body: response.data.body as null,
        status: response.data.status,
        error: null,
      },
      errors: [],
    };
  };
}
