import { Config } from "../../config/Config";
import { AvailabilityCheckAvailabilityIdScenario } from "../../Scenarios/Availability/AvailabilityCheckAvailabilityId";
import { AvailabilityCheckBadRequestScenario } from "../../Scenarios/Availability/AvailabilityCheckBadRequest";
import { AvailabilityCheckDateScenario } from "../../Scenarios/Availability/AvailabilityCheckDate";
import { AvailabilityChecIntervalScenario } from "../../Scenarios/Availability/AvailabilityCheckInterval";
import { AvailabilityCheckInvalidOptionScenario } from "../../Scenarios/Availability/AvailabilityCheckInvalidOption";
import { AvailabilityCheckInvalidProductScenario } from "../../Scenarios/Availability/AvailabilityCheckInvalidProduct";
import { AvailabilityCheckStatusScenario } from "../../Scenarios/Availability/AvailabilityCheckStatus";
import { BaseFlow } from "../BaseFlow";
import { Flow, FlowResult } from "../Flow";

export class AvailabilityFlow extends BaseFlow implements Flow {
  public config = Config.getInstance();
  constructor() {
    super("Availability Check");
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios = [
      new AvailabilityCheckStatusScenario(),
      ...this.checkInterval(),
      ...this.checkDate(),
      ...this.checkAvailabilityID(),
      new AvailabilityCheckInvalidProductScenario(),
      new AvailabilityCheckInvalidOptionScenario(),
      new AvailabilityCheckBadRequestScenario(),
    ];
    return this.validateScenarios(scenarios);
  };

  private checkInterval = () => {
    return this.config.productConfig.productsForAvailabilityCheck.map(
      (product) => new AvailabilityChecIntervalScenario(product)
    );
  };

  private checkDate = () => {
    return this.config.productConfig.productsForAvailabilityCheck.map(
      (product) => new AvailabilityCheckDateScenario(product)
    );
  };

  private checkAvailabilityID = () => {
    return this.config.productConfig.productsForAvailabilityCheck.map(
      (product) => new AvailabilityCheckAvailabilityIdScenario(product)
    );
  };
}
