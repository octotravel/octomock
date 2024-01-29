import { AvailabilityParser } from '@octocloud/generators';
import { CapabilityId, Availability, AvailabilityBodySchema } from '@octocloud/types';
import { AvailabilityService } from '../services/AvailabilityService';

interface IAvailabilityController {
  getAvailability: (schema: AvailabilityBodySchema, capabilities: CapabilityId[]) => Promise<Availability[]>;
}

export class AvailabilityController implements IAvailabilityController {
  private readonly availabilityService = new AvailabilityService();

  private readonly availabilityParser = new AvailabilityParser();

  public getAvailability = async (
    schema: AvailabilityBodySchema,
    capabilities: CapabilityId[],
  ): Promise<Availability[]> => {
    const availabilityModels = await this.availabilityService.getAvailability(schema, capabilities);
    return availabilityModels.map((availabilityModel) =>
      this.availabilityParser.parseModelToPOJOWithSpecificCapabilities(availabilityModel, capabilities),
    );
  };
}
