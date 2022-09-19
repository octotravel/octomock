import { Availability, Product } from "@octocloud/types";
import { Scenario } from "../Scenario";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";
import { Config } from "../../config/Config";

export class AvailabilityCheckAvailabilityIdScenario
  implements Scenario<Availability[]>
{
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();

  private product: Product;
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();

  constructor(product: Product) {
    this.product = product;
  }

  public validate = async () => {
    const availabilityID =
      this.config.productConfig.availabilityIDs[this.product.availabilityType];
    const result = await this.apiClient.getAvailability({
      productId: this.product.id,
      optionId: this.product.options[0].id,
      availabilityIds: [availabilityID],
    });

    const name = `Availability Check AvailabilityId (${this.product.availabilityType})`;

    return this.availabilityScenarioHelper.validateAvailability({
      name,
      result,
      product: this.product,
    });
  };
}
