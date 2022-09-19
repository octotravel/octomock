import { Availability } from "@octocloud/types";
import { DateHelper } from "../../../../helpers/DateHelper";
import { BadRequestErrorValidator } from "../../../../validators/backendValidator/Error/BadRequestErrorValidator";
import { Config } from "../../config/Config";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCheckBadRequestScenario
  implements Scenario<Availability[]>
{
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();

  public validate = async (): Promise<ScenarioResult<Availability[]>> => {
    const [product] = this.config.productConfig.productsForAvailabilityCheck;
    const availabilityID =
      this.config.productConfig.availabilityIDs[product.availabilityType];
    const result = await this.apiClient.getAvailability({
      productId: product.id,
      optionId: product.options[0].id,
      localDateStart: this.config.localDateStart,
      localDateEnd: this.config.localDateEnd,
      localDate: DateHelper.getDate(availabilityID),
      availabilityIds: [availabilityID],
    });

    const name = `Availability Check BAD_REQUEST (400 BAD_REQUEST)`;
    const error = "Response should be BAD_REQUEST";
    return this.availabilityScenarioHelper.validateError(
      {
        name,
        result,
      },
      error,
      new BadRequestErrorValidator()
    );
  };
}
