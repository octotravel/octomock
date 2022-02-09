// import { AvailabilityValidator } from './../validators/backendValidator/AvailabilityValidator';
import { AvailabilityService } from "./../services/AvailabilityService";
import { CapabilityId } from "../types/Capability";
import { Availability } from "../types/Availability";
import { AvailabilitySchema } from "../schemas/Availability";

interface IAvailabilityController {
  getAvailability(
    schema: AvailabilitySchema,
    capabilities: CapabilityId[]
  ): Promise<Availability[]>;
}

export class AvailabilityController implements IAvailabilityController {
  private availabilityService = new AvailabilityService();
  public getAvailability = async (
    schema: AvailabilitySchema,
    capabilities: CapabilityId[]
  ): Promise<Availability[]> => {
    const models = await this.availabilityService.getAvailability(
      schema,
      capabilities
    );
    const availability = models.map((m) =>
      m.toPOJO({ useCapabilities: true, capabilities })
    );

    // const validator = new AvailabilityValidator('', capabilities)
    // availability.forEach(a => {
    //   validator.validate(a)
    // })
    return availability;
  };
}
