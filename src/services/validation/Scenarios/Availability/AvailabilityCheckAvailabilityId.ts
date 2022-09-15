import { Availability, AvailabilityType } from "@octocloud/types";
import { Scenario } from "../Scenario";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";
import { Config } from "../../config/Config";

export class AvailabilityCheckAvailabilityIdScenario
  implements Scenario<Availability[]>
{
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getAvailability({
      productId: this.config.getStartTimeProducts()[0].product.id,
      optionId: this.config.getStartTimeProducts()[0].getOption().id,
      availabilityIds: [
        this.config.getStartTimeProducts()[0].getAvailabilityIDAvailable()[0],
      ],
    });

    const name = `Availability Check AvailabilityId (${AvailabilityType.START_TIME})`;

    return this.availabilityScenarioHelper.validateAvailability({
      name,
      result,
      availabilityType: AvailabilityType.START_TIME,
    });
  };
}
