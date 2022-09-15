import { Scenario } from "../../Scenarios/Scenario";
import { Flow, FlowResult } from "../Flow";
import { AvailabilityCalendarIntervalScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarInterval";
import { AvailabilityCalendarInvalidProductScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarInvalidProduct";
import { AvailabilityCalendarInvalidOptionScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarInvalidOption";
import { AvailabilityCalendarBadRequestScenario } from "../../Scenarios/AvailabilityCalendar/AvailabilityCalendarBadRequest";
import { BaseFlow } from "../BaseFlow";

export class AvailabilityCalendarFlow extends BaseFlow implements Flow {
  constructor() {
    super("Availability Calendar");
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios: Scenario<unknown>[] = [
      new AvailabilityCalendarIntervalScenario(),
      new AvailabilityCalendarInvalidProductScenario(),
      new AvailabilityCalendarInvalidOptionScenario(),
      new AvailabilityCalendarBadRequestScenario(),
    ];
    return this.validateScenarios(scenarios);
  };
}
