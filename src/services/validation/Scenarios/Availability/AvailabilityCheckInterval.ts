import { Availability } from "@octocloud/types";
import { Scenario } from "../Scenario";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";
import { Config } from "../../config/Config";
import { DateHelper } from "../../../../helpers/DateHelper";
import { addDays } from "date-fns";

export class AvailabilityCheckIntervalScenario
  implements Scenario<Availability[]>
{
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();

  public validate = async () => {
    const product = this.config.getProduct();
    const result = await this.apiClient.getAvailability({
      productId: product.id,
      optionId: product.options[0].id,
      localDateStart: DateHelper.getDate(new Date().toISOString()),
      localDateEnd: DateHelper.getDate(addDays(new Date(), 30).toISOString()),
    });
    const name = `Availability Check Interval (${product.availabilityType})`;

    return this.availabilityScenarioHelper.validateAvailability({
      result,
      name,
    });
  };
}
