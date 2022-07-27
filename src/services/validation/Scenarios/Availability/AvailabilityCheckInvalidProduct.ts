import * as R from "ramda";
import { InvalidProductIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";
import { ApiClient } from "../../ApiClient";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCheckInvalidProductScenario implements Scenario<null> {
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDate: string;
  constructor({
    apiClient,
    productId,
    optionId,
    localDate,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDate: string;
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDate = localDate;
  }

  public validate = async (): Promise<ScenarioResult<null>> => {
    const { request, response } = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      localDate: this.localDate,
    });

    const name = `Availability Check Invalid Product (400 INVALID_PRODUCT_ID)`;
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
        errors: ["Response should be INVALID_PRODUCT_ID"],
      };
    }

    const errors = new InvalidProductIdErrorValidator().validate(
      response.error
    );
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
