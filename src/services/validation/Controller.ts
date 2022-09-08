import { ConfigParser } from "./config/ConfigParser";
import { PreConfig } from "./config/PreConfig";
import { CapabilitiesFlow } from "./Flows/Capabilites/CapabilitiesFlow";
import { FlowResult } from "./Flows/Flow";
import { PrimiteFlows } from "./Flows/PrimitiveFlows";

export class ValidationController {
  private preConfig: PreConfig;
  constructor({ preConfig }: { preConfig: PreConfig }) {
    this.preConfig = preConfig;
  }

  public validate = async (): Promise<FlowResult[]> => {
    const preConfig = this.preConfig;
    const capabilitiesFlow = await new CapabilitiesFlow(preConfig).validate();

    const config = await new ConfigParser().fetch(preConfig, capabilitiesFlow);
    const primitiveFlows = await new PrimiteFlows({ config }).validate();

    // new ComplextFlows().validate()
    // const { data } await ProductScenario().validate()
    // const productId = data.id
    return [capabilitiesFlow, ...primitiveFlows];
  };
}
