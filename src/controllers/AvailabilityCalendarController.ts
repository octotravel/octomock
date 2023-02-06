import { AvailabilityCalendarParser } from "@octocloud/generators";
import { AvailabilityCalendar, CapabilityId, AvailabilityCalendarBodySchema } from "@octocloud/types";
import { AvailabilityCalendarService } from "../services/AvailabilityCalendarService";

interface IAvailabilityCalendarController {
  getAvailability(
    schema: AvailabilityCalendarBodySchema,
    capabilities: CapabilityId[]
  ): Promise<AvailabilityCalendar[]>;
}

export class AvailabilityCalendarController implements IAvailabilityCalendarController {
  private readonly service = new AvailabilityCalendarService();
  private readonly availabilityCalendarParser = new AvailabilityCalendarParser();

  public getAvailability = async (
    schema: AvailabilityCalendarBodySchema,
    capabilities: CapabilityId[]
  ): Promise<AvailabilityCalendar[]> => {
    const availabilityCalendarModels = await this.service.getAvailability(schema, capabilities);
    return availabilityCalendarModels.map((availabilityCalendarModel) =>
      this.availabilityCalendarParser.parseModelToPOJOWithSpecificCapabilities(availabilityCalendarModel, capabilities)
    );
  };
}
