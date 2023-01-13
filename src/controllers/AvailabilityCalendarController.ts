import {
  AvailabilityCalendar,
  CapabilityId,
  AvailabilityCalendarBodySchema,
} from "@octocloud/types";
import { AvailabilityCalendarService } from "../services/AvailabilityCalendarService";

interface IAvailabilityCalendarController {
  getAvailability(
    schema: AvailabilityCalendarBodySchema,
    capabilities: CapabilityId[]
  ): Promise<AvailabilityCalendar[]>;
}

export class AvailabilityCalendarController implements IAvailabilityCalendarController {
  private service = new AvailabilityCalendarService();
  public getAvailability = async (
    schema: AvailabilityCalendarBodySchema,
    capabilities: CapabilityId[]
  ): Promise<AvailabilityCalendar[]> => {
    const models = await this.service.getAvailability(schema, capabilities);
    return models.map((m) => m.toPOJO({ useCapabilities: true, capabilities }));
  };
}
