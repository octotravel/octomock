import { AvailabilityUnit } from "@octocloud/types";
import * as R from "ramda";
import { InvalidProductIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";
import { ApiClient } from "../../ApiClient";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCalendarInvalidProductScenario
  implements Scenario<null>
{
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDateStart: string;
  private localDateEnd: string;
  private units: AvailabilityUnit[];
  constructor({
    apiClient,
    productId,
    optionId,
    localDateStart,
    localDateEnd,
    units,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDateStart: string;
    localDateEnd: string;
    units?: AvailabilityUnit[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDateStart = localDateStart;
    this.localDateEnd = localDateEnd;
    this.units = units;
  }

  public validate = async (): Promise<ScenarioResult<null>> => {
    const { request, response } = await this.apiClient.getAvailabilityCalendar({
      productId: this.productId,
      optionId: this.optionId,
      localDateStart: this.localDateStart,
      localDateEnd: this.localDateEnd,
      units: this.units,
    });

    const name = `Availability Calendar Invalid Product`;
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
