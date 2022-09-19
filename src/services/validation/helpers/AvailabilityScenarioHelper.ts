import { Availability, Product } from "@octocloud/types";
import { AvailabilityValidator } from "../../../validators/backendValidator/Availability/AvailabilityValidator";
import { ScenarioHelper, ScenarioHelperData } from "./ScenarioHelper";
import { Config } from "../config/Config";

export class AvailabilityScenarioHelper extends ScenarioHelper {
  private config = Config.getInstance();

  public validateAvailability = (
    data: ScenarioHelperData<Availability[]>,
    product: Product
  ) => {
    const validator = new AvailabilityValidator({
      capabilities: this.config.getCapabilityIDs(),
      availabilityType: product.availabilityType,
    });
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = result.data.map(validator.validate).flat();

    return this.handleResult({
      ...data,
      errors,
    });
  };
}
