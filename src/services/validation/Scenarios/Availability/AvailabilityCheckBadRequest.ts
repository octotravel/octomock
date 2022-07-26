import * as R from "ramda";
import { BadRequestErrorValidator } from "../../../../validators/backendValidator/Error/BadRequestErrorValidator";
import { ApiClient } from "../../ApiClient";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCheckBadRequestScenario implements Scenario<null> {
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDate: string;
  private localDateStart: string;
  private localDateEnd: string;
  private availabilityIds: string[];
  constructor({
    apiClient,
    productId,
    optionId,
    localDate,
    localDateStart,
    localDateEnd,
    availabilityIds,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDate?: string;
    localDateStart?: string;
    localDateEnd?: string;
    availabilityIds?: string[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDate = localDate;
    this.localDateStart = localDateStart;
    this.localDateEnd = localDateEnd;
    this.availabilityIds = availabilityIds;
  }

  public validate = async (): Promise<ScenarioResult<null>> => {
    const { request, response } = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      localDate: this.localDate,
      localDateStart: this.localDateStart,
      localDateEnd: this.localDateEnd,
      availabilityIds: this.availabilityIds,
    });

    const name = `Availability Check BAD_REQUEST`;
    if (response.data) {
      return {
        name,
        success: false,
        request,
        response: {
          body: response.data.body as null,
          status: response.data.status,
          error: null,
        },
        errors: ["Response should be BAD_REQUEST"],
      };
    }

    const errors = new BadRequestErrorValidator().validate(response.error);
    if (!R.isEmpty(errors)) {
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
        errors: errors.map((error) => error.message),
      };
    }
    return {
      name,
      success: true,
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
  };
}
