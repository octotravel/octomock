import { Product } from "@octocloud/types";
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
      ...this.checkCalendarAvaialbility(),
      new AvailabilityCalendarInvalidProductScenario(),
      new AvailabilityCalendarInvalidOptionScenario(),
      new AvailabilityCalendarBadRequestScenario(),
    ];
    return this.validateScenarios(scenarios);
  };

  private checkCalendarAvaialbility =
    (): AvailabilityCalendarIntervalScenario[] => {
      const products = Array<Product>();
      if (this.config.productConfig.hasOpeningHourProducts) {
        products.push(this.config.productConfig.openingHourProducts[0]);
      }
      if (this.config.productConfig.hasStartTimeProducts) {
        products.push(this.config.productConfig.startTimeProducts[0]);
      }

      return products.map(
        (product) => new AvailabilityCalendarIntervalScenario(product)
      );
    };
}
