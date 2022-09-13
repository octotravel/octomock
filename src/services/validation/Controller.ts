import { CapabilitiesFlow } from "./Flows/Capabilites/CapabilitiesFlow";
import { FlowResult } from "./Flows/Flow";
import { PrimiteFlows } from "./Flows/PrimitiveFlows";

export class ValidationController {
  public validate = async (): Promise<FlowResult[]> => {
    const capabilitiesFlow = await new CapabilitiesFlow().validate();
    const primitiveFlows = await new PrimiteFlows().validate();

    // new ComplextFlows().validate()
    // const { data } await ProductScenario().validate()
    // const productId = data.id
    return [capabilitiesFlow, ...primitiveFlows];
  };
}
