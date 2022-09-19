import { Availability, Product } from "@octocloud/types";
import { AvailabilityValidator } from "../../../validators/backendValidator/Availability/AvailabilityValidator";
import { ScenarioHelper } from "./ScenarioHelper";
import { Result } from "../api/types";
import { Config } from "../config/Config";

export interface AvailabilityScenarioData<T> {
  name: string;
  result: Result<T>;
  product: Product;
}

export class AvailabilityScenarioHelper extends ScenarioHelper {
  private config = Config.getInstance();

  public validateAvailability = (
    data: AvailabilityScenarioData<Availability[]>
  ) => {
    const validator = new AvailabilityValidator({
      capabilities: this.config.getCapabilityIDs(),
      availabilityType: data.product.availabilityType,
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
