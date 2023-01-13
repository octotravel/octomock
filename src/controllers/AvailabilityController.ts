import { CapabilityId, Availability, AvailabilityBodySchema } from "@octocloud/types";
import { AvailabilityService } from "./../services/AvailabilityService";

interface IAvailabilityController {
  getAvailability(
    schema: AvailabilityBodySchema,
    capabilities: CapabilityId[]
  ): Promise<Availability[]>;
}

export class AvailabilityController implements IAvailabilityController {
  private availabilityService = new AvailabilityService();
  public getAvailability = async (
    schema: AvailabilityBodySchema,
    capabilities: CapabilityId[]
  ): Promise<Availability[]> => {
    const models = await this.availabilityService.getAvailability(schema, capabilities);
    const availability = models.map((m) => {
      return m.toPOJO({ useCapabilities: true, capabilities });
    });
    return availability;
  };
}
