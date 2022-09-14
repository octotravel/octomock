import { Scenario } from "./../../Scenarios/Scenario";
import { GetProductScenario } from "../../Scenarios/Product/GetProduct";
import { GetProductInvalidScenario } from "../../Scenarios/Product/GetProductInvalid";
import { GetProductsScenario } from "../../Scenarios/Product/GetProducts";
import { Flow, FlowResult } from "../Flow";
import { BaseFlow } from "../BaseFlow";

export class ProductFlow extends BaseFlow implements Flow {
  constructor() {
    super("Get Products");
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios: Scenario<unknown>[] = [
      new GetProductsScenario(),
      new GetProductScenario(),
      new GetProductInvalidScenario(),
    ];
    return this.validateScenarios(scenarios);
  };
}
