import { Scenario } from "../../Scenarios/Scenario";
import { GetSupplierScenario } from "../../Scenarios/Supplier/GetSuppliers";
import { BaseFlow } from "../BaseFlow";
import { Flow, FlowResult } from "../Flow";

export class SupplierFlow extends BaseFlow implements Flow {
  constructor() {
    super("Get Suppliers");
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios: Scenario<unknown>[] = [new GetSupplierScenario()];
    return this.validateScenarios(scenarios);
  };
}
