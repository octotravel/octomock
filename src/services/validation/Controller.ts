import { Config } from "./config/Config";
import { CapabilitiesFlow } from "./Flows/Capabilites/CapabilitiesFlow";
import { FlowResult } from "./Flows/Flow";
import { PrimiteFlows } from "./Flows/PrimitiveFlows";

export class ValidationController {
  private config: Config;
  constructor({ config }: { config: Config }) {
    this.config = config;
  }

  public validate = async (): Promise<FlowResult[]> => {
    const config = this.config;

    const capabilitiesFlow = await new CapabilitiesFlow({ config }).validate();

    const primitiveFlows = await new PrimiteFlows({ config }).validate();

    // new ComplextFlows().validate()
    // const { data } await ProductScenario().validate()
    // const productId = data.id
    return [capabilitiesFlow, ...primitiveFlows];
  };
}
