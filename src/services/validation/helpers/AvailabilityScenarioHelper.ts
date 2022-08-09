import { Availability, AvailabilityStatus } from "@octocloud/types";

export class AvailabilityScenarioHelper {
  public checkAvailabilityStatus = (availability: Availability[]) => {
    return availability
      .map((availability) => {
        return (
          !availability.available ||
          availability.status === AvailabilityStatus.CLOSED ||
          availability.status === AvailabilityStatus.SOLD_OUT
        );
      })
      .some((status) => status);
  };
}
