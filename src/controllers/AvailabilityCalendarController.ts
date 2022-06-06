import {
  AvailabilityCalendar,
  CapabilityId,
  AvailabilityCalendarSchema,
} from "@octocloud/types";
import { AvailabilityCalendarService } from "../services/AvailabilityCalendarService";

interface IAvailabilityCalendarController {
  getAvailability(
    schema: AvailabilityCalendarSchema,
    capabilities: CapabilityId[]
  ): Promise<AvailabilityCalendar[]>;
}

export class AvailabilityCalendarController
  implements IAvailabilityCalendarController
{
  private service = new AvailabilityCalendarService();
  public getAvailability = async (
    schema: AvailabilityCalendarSchema,
    capabilities: CapabilityId[]
  ): Promise<AvailabilityCalendar[]> => {
    const models = await this.service.getAvailability(schema, capabilities);
    return models.map((m) => m.toPOJO({ useCapabilities: true, capabilities }));
  };
}
