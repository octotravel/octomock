import { Availability, Product } from "@octocloud/types";
import { Scenario } from "../Scenario";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";
import { Config } from "../../config/Config";

export class AvailabilityChecIntervalScenario
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
    const result = await this.apiClient.getAvailability({
      productId: this.product.id,
      optionId: this.product.options[0].id,
      localDateStart: this.config.localDateStart,
      localDateEnd: this.config.localDateEnd,
    });

    const availabilities = result.data;
    const randomAvailability =
      availabilities[Math.floor(Math.random() * availabilities.length)];
    this.config.productConfig.addAvailabilityID = {
      availabilityType: this.product.availabilityType,
      availabilityID: randomAvailability.id,
    };
    console.log("fap", randomAvailability);

    const name = `Availability Check Interval (${this.product.availabilityType})`;
    return this.availabilityScenarioHelper.validateAvailability({
      name,
      result,
      product: this.product,
    });
  };
}
