import { Availability, Product } from "@octocloud/types";
import { AvailabilityValidator } from "../../../validators/backendValidator/Availability/AvailabilityValidator";
import { ScenarioHelper, ScenarioHelperData } from "./ScenarioHelper";

export class AvailabilityScenarioHelper extends ScenarioHelper {
  public validateAvailability = (data: ScenarioHelperData<Availability[]>, product: Product) => {
    const validator = new AvailabilityValidator({
      capabilities: this.config.getCapabilityIDs(),
      availabilityType: product.availabilityType,
    });
    const { result } = data;
    if (result?.response?.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }
    const availabilities = result?.data ?? [];

    const errors = availabilities.map(validator.validate).flat();

    return this.handleResult({
      ...data,
      errors,
    });
  };
}
